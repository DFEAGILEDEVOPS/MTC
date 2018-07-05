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
  if (isEmpty(adminStartDateData.adminStartDay.trim())) {
    validationError.addError('adminStartDay', checkWindowErrorMessages.adminStartDayRequired)
  }
  if (!isInt(adminStartDateData.adminStartDay, { min: 1, max: 31 })) {
    validationError.addError('adminStartDay', checkWindowErrorMessages.adminStartDayWrongDay)
  }
  if (!XRegExp('^[0-9]+$').test(adminStartDateData.adminStartDay)) {
    validationError.addError('adminStartDay', checkWindowErrorMessages.adminStartDayInvalidChars)
  }
  // Admin start month
  if (isEmpty(adminStartDateData.adminStartMonth.trim())) {
    validationError.addError('adminStartMonth', checkWindowErrorMessages.adminStartMonthRequired)
  }
  if (!isInt(adminStartDateData.adminStartMonth, { min: 1, max: 12 })) {
    validationError.addError('adminStartMonth', checkWindowErrorMessages.adminStartMonthWrongDay)
  }
  if (!XRegExp('^[0-9]+$').test(adminStartDateData.adminStartMonth)) {
    validationError.addError('adminStartMonth', checkWindowErrorMessages.adminStartMonthInvalidChars)
  }
  // Admin start year
  if (isEmpty(adminStartDateData.adminStartYear.trim())) {
    validationError.addError('adminStartYear', checkWindowErrorMessages.adminStartYearRequired)
  }
  if (!isInt(adminStartDateData.adminStartYear, { min: currentYear, max: (currentYear * 1 + 10) })) {
    validationError.addError('adminStartYear', checkWindowErrorMessages.adminStartYearWrongDay)
  }
  if (adminStartDateData.adminStartYear.length !== 4) {
    validationError.addError('adminStartYear', checkWindowErrorMessages.enterValidYear)
  }
  if (!XRegExp('^[0-9]+$').test(adminStartDateData.adminStartYear)) {
    validationError.addError('adminStartYear', checkWindowErrorMessages.adminStartYearInvalidChars)
  }
}
