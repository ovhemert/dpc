'use strict'

const uuidv4 = require('uuid/v4')

const createRequest = function (cmd, params) {
  return {
    uuid: uuidv4(),
    type: 'request',
    cmd,
    params
  }
}

const createResponse = function (request, err, result) {
  let _err = (err) ? JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))) : null
  let _result = (!err) ? result : null
  return {
    uuid: request.uuid,
    type: 'response',
    cmd: request.cmd,
    to: request.replyTo,
    error: _err,
    result: _result
  }
}

module.exports.createRequest = createRequest
module.exports.createResponse = createResponse
