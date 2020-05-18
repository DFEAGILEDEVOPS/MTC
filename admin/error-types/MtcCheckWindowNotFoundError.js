'use strict'

const { mtcError } = require('./mtc-error')

class MtcCheckWindowNotFoundError extends mtcError {
  constructor (message) {
    super(message, 'The service manager must configure a valid check window')
    this.name = 'MtcCheckWindowNotFound'
  }
}

module.exports = MtcCheckWindowNotFoundError
