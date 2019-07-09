const mtcBaseError = require('./mtc-base.error')

class MtcCheckWindowNotFound extends mtcBaseError {
  constructor (message, userMessage) {
    super(message, userMessage)
    this.name = 'MtcCheckWindowNotFound'
  }
}

module.exports = MtcCheckWindowNotFound
