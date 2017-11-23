'use strict'

const ValidationError = require('../lib/validation-error')

const pupilAddService = {}

pupilAddService.addPupil = async function (data) {
  const error = new ValidationError()
  error.addError('upn', 'no good')
  throw (error)
}

module.exports = pupilAddService
