const ValidationError = require('../validation-error')
const SchoolImpersonationMessages = require('../errors/school-impersonation')

const isDfeNumberValid = (dfeNumber) => {
  let validationError = new ValidationError()
  if (!dfeNumber) {
    validationError.addError('dfeNumber', SchoolImpersonationMessages.noInput)
    return validationError
  }
  if (typeof dfeNumber !== 'string' || isNaN(dfeNumber)) {
    validationError.addError('dfeNumber', SchoolImpersonationMessages.incorrectType)
    return validationError
  }
  return validationError
}

const isSchoolRecordValid = (school) => {
  let validationError = new ValidationError()
  if (!school || !school.id) {
    validationError.addError('dfeNumber', SchoolImpersonationMessages.incorrectInput)
    return validationError
  }
  return validationError
}

module.exports = { isDfeNumberValid, isSchoolRecordValid }
