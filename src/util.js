'use strict'

function proxy (callback) {
  let _proxy = (params = {}, cb) => {
    callback(params, (err, res) => {
      if (err) {
        if (cb) { return cb(err) } else { return Promise.reject(err) }
      } else {
        if (cb) { return cb(null, res) } else { return Promise.resolve(res) }
      }
    })
  }
  return _proxy
}

module.exports.proxy = proxy
