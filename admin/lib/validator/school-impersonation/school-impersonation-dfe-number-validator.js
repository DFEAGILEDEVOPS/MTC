const ValidationError = require('../../validation-error')
const SchoolImpersonationMessages = require('../../errors/school-impersonation')

module.exports.validate = (school) => {
  let validationError = new ValidationError()
  if (!school || !school.id) {
    validationError.addError('dfeNumber', SchoolImpersonationMessages.incorrectInput)
    return validationError
  }
  return validationError
}
