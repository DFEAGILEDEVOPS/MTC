'use strict'
const { mtcError } = require('./mtc-error')

class DfeSignInError extends mtcError {
  /**
   *
   * @param {string} message
   * @param {string} userMessage - maybe displayed to the user on the error handling page
   * @param {Error} originalError
   */
  constructor (message, userMessage = '', originalError = null) {
    super(message, userMessage)
    this.name = 'DfeSignInError'
    this.originalError = originalError // wrapped error
  }
}

module.exports = DfeSignInError
