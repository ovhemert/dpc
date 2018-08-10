'use strict'

const _map = new WeakMap()

function _private (key) {
  if (!_map.has(key)) { _map.set(key, {}) }
  return _map.get(key)
}

module.exports = _private
