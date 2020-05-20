'use strict'

const { mtcError } = require('./mtc-error')

class MtcHelpdeskImpersonationError extends mtcError {
  constructor (message) {
    super(message, 'Helpdesk users must impersonate a school')
    this.name = 'MtcHelpdeskImpersonationError'
  }
}

module.exports = MtcHelpdeskImpersonationError
