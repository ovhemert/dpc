const tap = require('tap')

const message = require('../src/message')

tap.test('creates request message', (t) => {
  t.plan(4)
  const request = message.createRequest('function', { a: 1, b: 2 })
  t.equal(request.cmd, 'function')
  t.equal(request.type, 'request')
  t.match(request.params, { a: 1, b: 2 })
  t.match(request.uuid, /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
})

tap.test('creates response message', (t) => {
  t.plan(2)
  const request = message.createRequest('function', { a: 1, b: 2 })

  const responseErr = message.createResponse(request, new Error('failed'), null)
  t.equal(responseErr.error.message, 'failed')

  const responseRes = message.createResponse(request, null, 12345)
  t.equal(responseRes.result, 12345)
})
