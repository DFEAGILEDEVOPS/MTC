const ValidationError = require('../../validation-error')
const SchoolImpersonationMessages = require('../../errors/school-impersonation')

module.exports.validate = (dfeNumber) => {
  let validationError = new ValidationError()
  if (!dfeNumber) {
    validationError.addError('dfeNumber', SchoolImpersonationMessages.noInput)
    return validationError
  }
  return validationError
}
