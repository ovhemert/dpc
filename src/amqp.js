'use strict'

const os = require('os')
const amqplib = require('amqplib')

class AMQP {
  async connect (options = {}) {
    let self = this
    const { url } = options
    try {
      if (!url) { throw new Error('AMQP url missing.') }

      // connect and open channel
      const _connection = await amqplib.connect(url)
      const _channel = self.channel = await _connection.createChannel()
      _channel.prefetch(1)

      // ensure the broadcast exchange exists
      const _exchange = self.exchange = 'dpc_broadcast'
      await _channel.assertExchange(_exchange, 'fanout', { durable: false })

      // ensure the global queue exists
      const _queueGlobal = self.queueGlobal = 'dpc_global'
      await _channel.assertQueue(_queueGlobal, { durable: false })

      // create local process queue and bind to broadcast exchange
      const _localId = self.localId = `${os.hostname()}_${process.pid}`
      const _queueLocal = self.queueLocal = `dpc_local_${_localId}`
      await _channel.assertQueue(_queueLocal, { durable: false, exclusive: true, autoDelete: true })
      _channel.bindQueue(_queueLocal, _exchange, '')

      // generic consume handler
      const consume = (queue, msg) => {
        let _done = (err, res) => {
          self.channel.ack(msg)
          if (err) { console.log(err) }
        }
        try {
          let payload = JSON.parse(msg.content)
          self.receive(payload, _done)
        } catch (err) {
          _done(err)
        }
      }

      // receive message from local queue
      _channel.consume(_queueLocal, msg => {
        consume('local', msg)
      })

      // receive message from global queue
      _channel.consume(_queueGlobal, msg => {
        consume('global', msg)
      })
    } catch (err) {
      throw err
    }
  }
  request (msg) {
    msg.from = this.localId
    msg.replyTo = this.queueLocal
    const json = JSON.stringify(msg)
    this.channel.sendToQueue(this.queueGlobal, Buffer.from(json), { correlationId: msg.uuid, replyTo: msg.replyTo })
  }
  response (msg) {
    msg.from = this.localId
    const json = JSON.stringify(msg)
    this.channel.sendToQueue(msg.to, Buffer.from(json), { correlationId: msg.uuid })
  }
  receive (msg, done) {
    done()
  }
}

module.exports = AMQP
