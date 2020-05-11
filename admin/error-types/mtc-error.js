'use strict'

class mtcError extends Error {
  constructor (message, userMessage = '') {
    super(message)
    this.name = 'mtcBaseError'
    this.userMessage = userMessage
  }
}

exports.mtcError = mtcError

module.exports = {
  mtcError
}
