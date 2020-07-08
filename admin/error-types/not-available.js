'use strict'

const { mtcError } = require('./mtc-error')

class NotAvailableError extends mtcError {
  constructor (message) {
    const userMessage = 'This resource is not available'
    super(message, userMessage)
    this.name = 'NotAvailableError'
    this.status = 404
  }
}

module.exports = NotAvailableError
