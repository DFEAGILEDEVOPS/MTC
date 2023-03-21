'use strict'

const { mtcError } = require('./mtc-error')
const userInitErrorConsts = require('../lib/errors/user')

class DsiSchoolNotFoundError extends mtcError {
  constructor (urn) {
    const message = `School with URN:${urn} is not registered in MTC`
    super(message, message)
    this.code = userInitErrorConsts.schoolNotFound
  }
}

module.exports = {
  DsiSchoolNotFoundError
}
