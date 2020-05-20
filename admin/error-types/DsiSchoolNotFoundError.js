'use strict'

const { mtcError } = require('./mtc-error')

class DsiSchoolNotFoundError extends mtcError {
  constructor (urn) {
    const message = `School with URN:${urn} is not registered in MTC`
    super(message, message)
  }
}

module.exports = {
  DsiSchoolNotFoundError
}
