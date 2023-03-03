'use strict'

const { mtcError } = require('./mtc-error')

class SystemUnavailableError extends mtcError {
  constructor () {
    const message = 'The system is unavailable at this time'
    super(message)
    this.name = 'SystemUnavailableError'
    this.userMessage = message
    this.code = 'SYSTEM_UNAVAILABLE'
  }
}

module.exports = {
  SystemUnavailableError
}
