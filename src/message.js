'use strict'

const uuidv4 = require('uuid/v4')

const createRequest = function (cmd, params, options = {}) {
  const properties = Object.assign({}, options, {
    messageId: uuidv4(),
    type: 'request',
    expiration: options.ttl,
    broadcast: options.broadcast
  })
  return {
    properties: properties,
    content: { cmd, params }
  }
}

const createResponse = function (request, err, result) {
  const _err = (err) ? JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))) : null
  const _result = (!err) ? result : null
  const properties = Object.assign({}, {
    correlationId: request.properties.messageId,
    messageId: uuidv4(),
    sendTo: request.properties.replyTo,
    type: 'response'
  })
  return {
    properties: properties,
    content: {
      cmd: request.content.cmd,
      error: _err,
      result: _result
    }
  }
}

const getRequest = function (msg) {
  const content = JSON.parse(msg.content)
  const { appId, messageId, replyTo, type } = msg.properties
  return {
    properties: { appId, messageId, replyTo, type },
    content: content
  }
}

const getResponse = function (msg) {
  const content = JSON.parse(msg.content)
  const { correlationId, messageId, type } = msg.properties
  return {
    properties: { correlationId, messageId, type },
    content: content
  }
}

const getFromQueue = function (msg) {
  const { type } = msg.properties
  if (type === 'request') {
    return getRequest(msg)
  } else if (type === 'response') {
    return getResponse(msg)
  } else {
    return null
  }
}

module.exports.createRequest = createRequest
module.exports.createResponse = createResponse
module.exports.getFromQueue = getFromQueue
