var moment = require('moment-timezone')
const { isEmpty } = require('validator')
const ValidationError = require('../validation-error')
const sceErrorMessages = require('../errors/sce')
const sceSchoolValidator = {}

/**
 * Validate restart reason
 * @param {String} restartCode
 * @param {String} reason
 * @returns {Promise<ValidationError>}
 */
sceSchoolValidator.validate = async (data, schoolNames, schoolUrns) => {
  const validationError = new ValidationError()
  const {
    schoolName,
    urn,
    timezone
  } = data

  if (isEmpty(schoolName) || !schoolNames.includes(schoolName)) {
    validationError.addError('schoolName', sceErrorMessages.schoolName)
  }

  if (isEmpty(urn) || !schoolUrns.includes(parseInt(urn, 10))) {
    validationError.addError('urn', sceErrorMessages.urn)
  }

  const timezones = moment.tz.names()
  if (!isEmpty(timezone) && !timezones.includes(timezone)) {
    validationError.addError('timezone', sceErrorMessages.timezone)
  }

  return validationError
}

module.exports = sceSchoolValidator
