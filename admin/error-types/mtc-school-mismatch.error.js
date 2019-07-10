const mtcBaseError = require('./mtc-base.error')

class MtcSchoolMismatchError extends mtcBaseError {
  constructor (message) {
    super(message, 'The selected school is not registered in MTC')
    this.name = 'MtcSchoolMismatchError'
  }
}

module.exports = MtcSchoolMismatchError
