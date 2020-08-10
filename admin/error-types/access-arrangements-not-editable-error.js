'use strict'

const { mtcError } = require('./mtc-error')

class AccessArrangementsNotEditableError extends mtcError {
  constructor () {
    const message = 'Access Arrangements are not editable at this time'
    super(message, message)
    this.name = 'AccessArrangementsNotEditableError'
  }
}

module.exports = {
  AccessArrangementsNotEditableError
}
