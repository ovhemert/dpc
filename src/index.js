'use strict'

const AMQP = require('./amqp')
const dotenv = require('dotenv')

const message = require('./message')
const util = require('./util')
const _private = require('./private')

dotenv.config()

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
      // TODO: refactor
      try {
        const { cmd, type, uuid, params } = msg
        // console.log(`type => ${type}`)
        if (type === 'request' && cmd && uuid) {
          // execute a function and return the result
          const func = _private(self).functions[cmd]
          if (!func) { throw Error('Function not found') }
          try {
            func(params, (err, res) => {
              // create the message
              let msgRes = message.createResponse(msg, err, res)
              // queue message
              _private(self).amqp.response(msgRes)
            })
          } catch (err) {
            // create the error message
            let msgRes = message.createResponse(msg, err, null)
            // queue message
            _private(self).amqp.response(msgRes)
          }
          // done
          done()
        } else if (type === 'response' && cmd && uuid) {
          // find the request callback that belongs to this response
          const callback = _private(self).callbacks[uuid]
          if (!callback) { throw Error('Callback not found') }
          // trigger result
          let err = (msg.error) ? new Error(msg.error.message) : null
          if (err) { err.stack = msg.error.stack }
          callback.done(err, msg.result)
          // done
          done()
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
    _functions[func.name] = func
    // create proxied function
    self.functions[func.name] = util.proxy(function (params, done) {
      // create the message
      let msg = message.createRequest(func.name, params)
      // register callback
      let _callbacks = _private(self).callbacks
      _callbacks[msg.uuid] = new Callback(done)
      // queue message for execution
      _private(self).amqp.request(msg)
    })
  }
}

module.exports = DPC
