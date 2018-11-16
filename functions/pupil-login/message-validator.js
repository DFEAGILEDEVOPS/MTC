'use strict'

function validateMessage (message) {
  if (!message) {
    throw new Error('Message missing')
  }

  if (!(typeof message === 'object')) {
    throw new Error('Message is invalid')
  }

  if (!message.version) {
    throw new Error('Message version is unspecified')
  }

  if (!message.checkCode) {
    throw new Error('Message is invalid: checkCode missing')
  }

  if (!message.loginAt) {
    throw new Error('Message is invalid: login date missing')
  }
}

module.exports = validateMessage
