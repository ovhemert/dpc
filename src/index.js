'use strict'

const AMQP = require('./amqp')
const dotenv = require('dotenv')

const message = require('./message')
const util = require('./util')
const _private = require('./private')

dotenv.config()

function onRequest (msg, done) {
  // execute a function and return the result
  const self = this
  const { cmd, params } = msg.content
  const { amqp, functions } = _private(self)
  // check if function is valid
  const _function = functions[cmd]
  if (!_function) { throw Error('Function not found') }
  if (_function.options.remoteOnly && amqp.localId === msg.properties.appId) { return done(Error('NACK: Function should only run remote')) }
  // execute a function and return the result
  try {
    const func = _function.func
    func(params, (err, res) => {
      // create the message
      let msgRes = message.createResponse(msg, err, res)
      // queue message
      amqp.response(msgRes)
    })
  } catch (err) {
    // create the error message
    let msgRes = message.createResponse(msg, err, null)
    // queue message
    amqp.response(msgRes)
  }
  // done
  done()
}

function onResponse (msg, done) {
  const self = this
  // find the request callback that belongs to this response
  const { correlationId } = msg.properties
  const callback = _private(self).callbacks[correlationId]
  if (!callback) { throw Error('Callback not found') }
  // trigger result
  let err = (msg.content.error) ? new Error(msg.content.error.message) : null
  if (err) { err.stack = msg.content.error.stack }
  callback.done(err, msg.content.result)
  // done
  done()
}

function proxy (func) {
  // proxy the registered function
  const self = this
  return util.proxy(function (params, done) {
    // create the message
    let msg = message.createRequest(func.name, params)
    // register callback
    let _callbacks = _private(self).callbacks
    _callbacks[msg.properties.messageId] = new Callback(done)
    // queue message for execution
    _private(self).amqp.request(msg)
  })
}

class Callback {
  constructor (done) {
    this.done = done
  }
}

class DPC {
  constructor () {
    _private(this).amqp = new AMQP()
    _private(this).functions = {}
    _private(this).callbacks = {}
    this.functions = {}
  }
  async connect (options = {}) {
    const self = this
    const url = options.url || process.env['AMQP_URL']
    let _amqp = _private(self).amqp
    await _amqp.connect({ url: url })
    _amqp.receive = (msg, done) => {
      try {
        const { type, messageId } = msg.properties
        if (type === 'request' && messageId) {
          onRequest.call(self, msg, done)
        } else if (type === 'response') {
          onResponse.call(self, msg, done)
        } else {
          throw Error('Unknown message type')
        }
      } catch (err) {
        done(err)
      }
    }
  }
  register (func, options) {
    const self = this
    if (!func.name) { throw new Error('Anonymous functions not allowed') }
    // save original function
    let _functions = _private(self).functions
    const _function = { func: func, options: options }
    _functions[func.name] = _function
    // create proxied function
    self.functions[func.name] = proxy.call(self, func)
  }
}

module.exports = DPC
