const mtcBaseError = require('./mtc-base.error')

class MtcHelpdeskImpersonationError extends mtcBaseError {
  constructor (message) {
    super(message, 'Helpdesk users must impersonate a school')
    this.name = 'MtcHelpdeskImpersonationError'
  }
}

module.exports = MtcHelpdeskImpersonationError
