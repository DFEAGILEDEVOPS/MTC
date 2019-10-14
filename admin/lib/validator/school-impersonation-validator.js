const ValidationError = require('../validation-error')
const SchoolImpersonationMessages = require('../errors/school-impersonation')

const isDfeNumberValid = (dfeNumber) => {
  const validationError = new ValidationError()
  if (!dfeNumber) {
    validationError.addError('dfeNumber', SchoolImpersonationMessages.noInput)
    return validationError
  }
  const isNumericRegex = new RegExp(/^\d+$/)
  if (typeof dfeNumber !== 'string' || !isNumericRegex.test(dfeNumber)) {
    validationError.addError('dfeNumber', SchoolImpersonationMessages.incorrectType)
    return validationError
  }
  return validationError
}

const isSchoolRecordValid = (school) => {
  const validationError = new ValidationError()
  if (!school || !school.id) {
    validationError.addError('dfeNumber', SchoolImpersonationMessages.incorrectInput)
    return validationError
  }
  return validationError
}

module.exports = { isDfeNumberValid, isSchoolRecordValid }
