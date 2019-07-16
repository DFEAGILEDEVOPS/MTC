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

class MtcSchoolMismatchError extends mtcError {
  constructor (message) {
    super(message, 'The selected school is not registered in MTC')
    this.name = 'MtcSchoolMismatchError'
  }
}

module.exports = { mtcError, MtcCheckWindowNotFoundError, MtcHelpdeskImpersonationError, MtcSchoolMismatchError }
