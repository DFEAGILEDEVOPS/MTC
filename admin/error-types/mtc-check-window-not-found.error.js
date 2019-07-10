const mtcBaseError = require('./mtc-base.error')

class MtcCheckWindowNotFound extends mtcBaseError {
  constructor (message) {
    super(message, 'Service manager must select a valid check window')
    this.name = 'MtcCheckWindowNotFound'
  }
}

module.exports = MtcCheckWindowNotFound
