const mtcBaseError = require('./mtc-base.error')

class MtcHelpdeskImpersonationError extends mtcBaseError {
  constructor (message, userMessage) {
    super(message, userMessage)
    this.name = 'MtcHelpdeskImpersonationError'
  }
}

module.exports = MtcHelpdeskImpersonationError
