'use strict'

const { mtcError } = require('./mtc-error')

class SystemUnavailableError extends mtcError {
  constructor (message, userMessage = '') {
    super(message)
    this.name = 'SystemUnavailableError'
    this.userMessage = userMessage
    this.code = 'SYSTEM_UNAVAILABLE'
  }
}

module.exports = {
  SystemUnavailableError
}
