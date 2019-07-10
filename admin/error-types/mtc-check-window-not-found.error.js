const mtcBaseError = require('./mtc-base.error')

class MtcCheckWindowNotFoundError extends mtcBaseError {
  constructor (message) {
    super(message, 'The service manager must configure a valid check window')
    this.name = 'MtcCheckWindowNotFound'
  }
}

module.exports = MtcCheckWindowNotFoundError
