const mtcBaseError = require('./mtc-base.error')

class MtcSchoolMismatchError extends mtcBaseError {
  constructor (message) {
    super(message, 'The school is not found in the MTC database')
    this.name = 'MtcSchoolMismatchError'
  }
}

module.exports = MtcSchoolMismatchError
