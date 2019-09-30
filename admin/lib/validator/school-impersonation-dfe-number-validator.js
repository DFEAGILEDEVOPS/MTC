const ValidationError = require('../validation-error')
const SchoolImpersonationMessages = require('../errors/school-impersonation')

const isDfeNumberEmpty = (dfeNumber) => {
  let validationError = new ValidationError()
  if (!dfeNumber) {
    validationError.addError('dfeNumber', SchoolImpersonationMessages.noInput)
    return validationError
  }
  return validationError
}

const isDfeNumberValid = (school) => {
  let validationError = new ValidationError()
  if (!school || !school.id) {
    validationError.addError('dfeNumber', SchoolImpersonationMessages.incorrectInput)
    return validationError
  }
  return validationError
}

module.exports = { isDfeNumberEmpty, isDfeNumberValid }
