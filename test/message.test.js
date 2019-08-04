const tap = require('tap')

const message = require('../src/message')

tap.test('creates request message', (t) => {
  t.plan(4)
  const request = message.createRequest('function', { a: 1, b: 2 }, { ttl: 5000 })
  t.equal(request.properties.type, 'request')
  t.match(request.properties.messageId, /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  t.equal(request.content.cmd, 'function')
  t.match(request.content.params, { a: 1, b: 2 })
})

tap.test('creates response message', (t) => {
  t.plan(9)
  const request = message.createRequest('function', { a: 1, b: 2 })
  request.properties.messageId = 'foo'
  request.properties.replyTo = 'bar'

  const responseRes = message.createResponse(request, null, 12345)
  t.equal(responseRes.properties.type, 'response')
  t.match(responseRes.properties.messageId, /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  t.equal(responseRes.properties.sendTo, request.properties.replyTo)
  t.equal(responseRes.properties.correlationId, request.properties.messageId)
  t.equal(responseRes.content.cmd, request.content.cmd)
  t.equal(responseRes.content.error, null)
  t.equal(responseRes.content.result, 12345)

  const responseErr = message.createResponse(request, new Error('failed'), null)
  t.equal(responseErr.content.error.message, 'failed')
  t.equal(responseErr.content.result, null)
})

tap.test('gets queue message', (t) => {
  t.plan(8)

  const reqMsg = {
    properties: { appId: 'foo', messageId: 'bar', replyTo: 'me', type: 'request' },
    content: Buffer.from(JSON.stringify({ a: 1 }))
  }
  const request = message.getFromQueue(reqMsg)
  t.equal(request.properties.appId, 'foo')
  t.equal(request.properties.messageId, 'bar')
  t.equal(request.properties.replyTo, 'me')
  t.equal(request.properties.type, 'request')

  const resMsg = {
    properties: { correlationId: 'foo', messageId: 'bar', type: 'response' },
    content: Buffer.from(JSON.stringify({ a: 1 }))
  }
  const response = message.getFromQueue(resMsg)
  t.equal(response.properties.correlationId, 'foo')
  t.equal(response.properties.messageId, 'bar')
  t.equal(response.properties.type, 'response')

  const foo = message.getFromQueue({ properties: { type: 'bar' } })
  t.equal(foo, null)
})
