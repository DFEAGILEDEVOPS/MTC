'use strict'

class mtcError extends Error {
  constructor (message, userMessage = '') {
    super(message)
    this.name = 'mtcBaseError'
    this.userMessage = userMessage
  }
}

class MtcCheckWindowNotFoundError extends mtcError {
  constructor (message) {
    super(message, 'The service manager must configure a valid check window')
    this.name = 'MtcCheckWindowNotFound'
  }
}

class MtcHelpdeskImpersonationError extends mtcError {
  constructor (message) {
    super(message, 'Helpdesk users must impersonate a school')
    this.name = 'MtcHelpdeskImpersonationError'
  }
}

module.exports = {
  mtcError,
  MtcCheckWindowNotFoundError,
  MtcHelpdeskImpersonationError
}
