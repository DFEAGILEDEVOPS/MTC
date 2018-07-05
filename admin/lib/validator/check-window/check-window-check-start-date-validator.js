'use strict'
const moment = require('moment')

const checkWindowErrorMessages = require('../../errors/check-window')
const XRegExp = require('xregexp')
const { isEmpty, isInt } = require('validator')

/**
 * Validates check window check start date data
 * @param {Object} validationError
 * @param {Object} checkStartDateData
 */
module.exports.validate = (validationError, checkStartDateData) => {
  const currentYear = moment.utc().format('YYYY')
// Check start day
  if (isEmpty(checkStartDateData.checkStartDay.trim())) {
    validationError.addError('checkStartDay', checkWindowErrorMessages.checkStartDayRequired)
  }
  if (!isInt(checkStartDateData.checkStartDay, { min: 1, max: 31 })) {
    validationError.addError('checkStartDay', checkWindowErrorMessages.checkStartDayWrongDay)
  }
  if (!XRegExp('^[0-9]+$').test(checkStartDateData.checkStartDay)) {
    validationError.addError('checkStartDay', checkWindowErrorMessages.checkStartDayInvalidChars)
  }
// Check start month
  if (isEmpty(checkStartDateData.checkStartMonth.trim())) {
    validationError.addError('checkStartMonth', checkWindowErrorMessages.checkStartMonthRequired)
  }
  if (!isInt(checkStartDateData.checkStartMonth, { min: 1, max: 12 })) {
    validationError.addError('checkStartMonth', checkWindowErrorMessages.checkStartMonthWrongDay)
  }
  if (!XRegExp('^[0-9]+$').test(checkStartDateData.checkStartMonth)) {
    validationError.addError('checkStartMonth', checkWindowErrorMessages.checkStartMonthInvalidChars)
  }
// Check start year
  if (isEmpty(checkStartDateData.checkStartYear.trim())) {
    validationError.addError('checkStartYear', checkWindowErrorMessages.checkStartYearRequired)
  }
  if (!isInt(checkStartDateData.checkStartYear, { min: currentYear, max: (currentYear * 1 + 10) })) {
    validationError.addError('checkStartYear', checkWindowErrorMessages.checkStartYearWrongDay)
  }
  if (checkStartDateData.checkStartYear.length !== 4) {
    validationError.addError('checkStartYear', checkWindowErrorMessages.enterValidYear)
  }
  if (!XRegExp('^[0-9]+$').test(checkStartDateData.checkStartYear)) {
    validationError.addError('checkStartYear', checkWindowErrorMessages.checkStartYearInvalidChars)
  }
}
