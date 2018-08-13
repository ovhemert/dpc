'use strict'

const tap = require('tap')

const util = require('../src/util')

tap.test('creates proxy with callback', (t) => {
  t.plan(2)

  const funcOk = util.proxy(function (params, done) { return done(null, true) })
  funcOk({}, function (err, res) {
    if (err || res) {}
    t.ok(res)
  })

  const funcErr = util.proxy(function (params, done) { return done(new Error('failed')) })
  funcErr({}, function (err, res) {
    if (err || res) {}
    t.ok(err.message === 'failed')
  })
})

tap.test('creates proxy with promise', (t) => {
  t.plan(2)

  const funcOk = util.proxy(function (params, done) { return done(null, true) })
  t.resolves(funcOk())

  const funcErr = util.proxy(function (params, done) { return done(new Error('failed')) })
  t.rejects(funcErr())
})
