var moment = require('moment-timezone')
const { isEmpty } = require('validator')
const XRegExp = require('xregexp')
const ValidationError = require('../validation-error')
const sceService = require('../../services/sce-service.js')
const sceErrorMessages = require('../errors/sce')
const sceSchoolValidator = {}

/**
 * Validate restart reason
 * @param {String} restartCode
 * @param {String} reason
 * @returns {Boolean}
 */
sceSchoolValidator.validate = (data) => {
  const validationError = new ValidationError()
  const {
    schoolName,
    urn,
    timezone
  } = data

  if (isEmpty(schoolName) || sceService.findSchoolByName(schoolName)) {
    validationError.addError('schoolName', sceErrorMessages.schoolName)
  }

  if (isEmpty(urn) || !XRegExp('^[0-9]{13}$').test(urn) || sceService.findSchoolByURN(urn)) {
    validationError.addError('urn', sceErrorMessages.urn)
  }

  const timezones = moment.tz.names()
  if (isEmpty(timezone) || timezones.indexOf(timezone) === -1) {
    validationError.addError('timezone', sceErrorMessages.urn)
  }
}

module.exports = sceSchoolValidator
