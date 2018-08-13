'use strict'

const tap = require('tap')

const _private = require('../src/private')

tap.test('saves private properties', (t) => {
  t.plan(1)

  _private(this).foo = 'bar'
  const foo = _private(this).foo
  t.equal(foo, 'bar')
})
