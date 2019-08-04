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
      const msgRes = message.createResponse(msg, err, res)
      // queue message
      amqp.response(msgRes)
    })
  } catch (err) {
    // create the error message
    const msgRes = message.createResponse(msg, err, null)
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
  const err = (msg.content.error) ? new Error(msg.content.error.message) : null
  if (err) { err.stack = msg.content.error.stack }
  callback.response(err, msg.content.result)
  // done
  done()
}

function proxy (_function) {
  // proxy the registered function
  const self = this
  return util.proxy(function (params, done) {
    // create the message
    const msg = message.createRequest(_function.func.name, params, _function.options)
    // register callback
    const _callbacks = _private(self).callbacks
    const cbDone = (err, res) => {
      delete _callbacks[msg.properties.messageId]
      return done(err, res)
    }
    _callbacks[msg.properties.messageId] = new Callback(cbDone, _function.options)
    // queue message for execution
    _private(self).amqp.request(msg)
  })
}

class Callback {
  constructor (func, options) {
    const _responses = []
    this.response = (err, res) => {
      if (err) { return this.done(err, null) }
      if (options.broadcast) { return _responses.push(res) }
      this.done(null, res)
    }
    this.done = (err, res) => {
      this._finished = true
      clearTimeout(this._ttlTimer)
      return func(err, res)
    }
    this._finished = false
    this._ttlTimer = setTimeout(() => {
      if (this._finished) { return }
      if (options.broadcast && _responses.length > 0) { return this.done(null, _responses) }
      return this.done(Error('Timeout'))
    }, options.ttl)
  }
}

class FunctionStore {
  constructor (func, options) {
    this.func = func
    this.options = Object.assign({}, {
      ttl: 1000
    }, options)
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
    const _amqp = _private(self).amqp
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
    const _functions = _private(self).functions
    const _function = new FunctionStore(func, options)
    _functions[func.name] = _function
    // create proxied function
    self.functions[func.name] = proxy.call(self, _function)
  }
}

module.exports = DPC
