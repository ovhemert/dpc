'use strict'

function proxy (callback) {
  const _proxy = (params = {}, cb) => {
    if (cb) {
      callback(params, cb)
    } else {
      return new Promise((resolve, reject) => {
        callback(params, (err, res) => {
          if (err) { return reject(err) }
          return resolve(res)
        })
      })
    }
  }
  return _proxy
}

module.exports.proxy = proxy
