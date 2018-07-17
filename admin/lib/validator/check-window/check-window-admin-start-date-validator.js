'use strict'
const moment = require('moment')

const checkWindowErrorMessages = require('../../errors/check-window')
const XRegExp = require('xregexp')
const { isEmpty, isInt } = require('validator')

/**
 * Validates check window admin start date data
 * @param {Object} validationError
 * @param {Object} adminStartDateData
 */
module.exports.validate = (validationError, adminStartDateData) => {
  const currentYear = moment.utc().format('YYYY')
  // Admin start day
  const isAdminStartDayEmpty = isEmpty(adminStartDateData.adminStartDay.trim())
  if (isAdminStartDayEmpty) {
    validationError.addError('adminStartDay', checkWindowErrorMessages.adminStartDayRequired)
  }
  if (!isAdminStartDayEmpty && !isInt(adminStartDateData.adminStartDay, { min: 1, max: 31 })) {
    validationError.addError('adminStartDay', checkWindowErrorMessages.adminStartDayWrongDay)
  }
  if (!isAdminStartDayEmpty && !XRegExp('^[0-9]+$').test(adminStartDateData.adminStartDay)) {
    validationError.addError('adminStartDay', checkWindowErrorMessages.adminStartDayInvalidChars)
  }
  // Admin start month
  const isAdminStartMonthEmpty = isEmpty(adminStartDateData.adminStartMonth.trim())
  if (isAdminStartMonthEmpty) {
    validationError.addError('adminStartMonth', checkWindowErrorMessages.adminStartMonthRequired)
  }
  if (!isAdminStartMonthEmpty && !isInt(adminStartDateData.adminStartMonth, { min: 1, max: 12 })) {
    validationError.addError('adminStartMonth', checkWindowErrorMessages.adminStartMonthWrongDay)
  }
  if (!isAdminStartMonthEmpty && !XRegExp('^[0-9]+$').test(adminStartDateData.adminStartMonth)) {
    validationError.addError('adminStartMonth', checkWindowErrorMessages.adminStartMonthInvalidChars)
  }
  // Admin start year
  const isAdminStartYearEmpty = isEmpty(adminStartDateData.adminStartYear.trim())
  if (isAdminStartYearEmpty) {
    validationError.addError('adminStartYear', checkWindowErrorMessages.adminStartYearRequired)
  }
  if (!isAdminStartYearEmpty && !isInt(adminStartDateData.adminStartYear, { min: currentYear, max: (currentYear * 1 + 10) })) {
    validationError.addError('adminStartYear', checkWindowErrorMessages.adminStartYearWrongDay)
  }
  if (!isAdminStartYearEmpty && adminStartDateData.adminStartYear.length !== 4) {
    validationError.addError('adminStartYear', checkWindowErrorMessages.enterValidYear)
  }
  if (!isAdminStartYearEmpty && !XRegExp('^[0-9]+$').test(adminStartDateData.adminStartYear)) {
    validationError.addError('adminStartYear', checkWindowErrorMessages.adminStartYearInvalidChars)
  }
}
