const ValidationError = require('../validation-error')
const SchoolImpersonationMessages = require('../errors/school-impersonation')

const isDfeNumberValidV2 = (dfeNumber) => {
  const validationError = new ValidationError()

  if (typeof dfeNumber === 'string') {
    dfeNumber = dfeNumber.trim()
    if (dfeNumber[3] === '-' || dfeNumber[3] === '/') {
      dfeNumber = dfeNumber.slice(0, 3) + dfeNumber.slice(4)
    }
  }

  const sevenDigitRegex = new RegExp(/^\d{7}$/)
  if (!sevenDigitRegex.test(dfeNumber)) {
    validationError.addError('dfeNumber', SchoolImpersonationMessages.incorrectType)
    return validationError
  }
  return validationError
}

const isSchoolRecordValid = (school) => {
  const validationError = new ValidationError()
  if (!school || !school.id) {
    validationError.addError('dfeNumber', SchoolImpersonationMessages.noMatch)
    return validationError
  }
  return validationError
}

module.exports = { isDfeNumberValid: isDfeNumberValidV2, isSchoolRecordValid }
