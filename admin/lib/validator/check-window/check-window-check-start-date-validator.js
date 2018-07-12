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
  const isCheckStartDayEmpty = isEmpty(checkStartDateData.checkStartDay.trim())
  if (isCheckStartDayEmpty) {
    validationError.addError('checkStartDay', checkWindowErrorMessages.checkStartDayRequired)
  }
  if (!isCheckStartDayEmpty && !isInt(checkStartDateData.checkStartDay, { min: 1, max: 31 })) {
    validationError.addError('checkStartDay', checkWindowErrorMessages.checkStartDayWrongDay)
  }
  if (!isCheckStartDayEmpty && !XRegExp('^[0-9]+$').test(checkStartDateData.checkStartDay)) {
    validationError.addError('checkStartDay', checkWindowErrorMessages.checkStartDayInvalidChars)
  }
  // Check start month
  const isCheckStartMonthEmpty = isEmpty(checkStartDateData.checkStartMonth.trim())
  if (isCheckStartMonthEmpty) {
    validationError.addError('checkStartMonth', checkWindowErrorMessages.checkStartMonthRequired)
  }
  if (!isCheckStartMonthEmpty && !isInt(checkStartDateData.checkStartMonth, { min: 1, max: 12 })) {
    validationError.addError('checkStartMonth', checkWindowErrorMessages.checkStartMonthWrongDay)
  }
  if (!isCheckStartMonthEmpty && !XRegExp('^[0-9]+$').test(checkStartDateData.checkStartMonth)) {
    validationError.addError('checkStartMonth', checkWindowErrorMessages.checkStartMonthInvalidChars)
  }
  // Check start year
  const isCheckStartYearEmpty = isEmpty(checkStartDateData.checkStartYear.trim())
  if (isCheckStartYearEmpty) {
    validationError.addError('checkStartYear', checkWindowErrorMessages.checkStartYearRequired)
  }
  if (!isCheckStartYearEmpty && !isInt(checkStartDateData.checkStartYear, { min: currentYear, max: (currentYear * 1 + 10) })) {
    validationError.addError('checkStartYear', checkWindowErrorMessages.checkStartYearWrongDay)
  }
  if (!isCheckStartYearEmpty && checkStartDateData.checkStartYear.length !== 4) {
    validationError.addError('checkStartYear', checkWindowErrorMessages.enterValidYear)
  }
  if (!isCheckStartYearEmpty && !XRegExp('^[0-9]+$').test(checkStartDateData.checkStartYear)) {
    validationError.addError('checkStartYear', checkWindowErrorMessages.checkStartYearInvalidChars)
  }
}
