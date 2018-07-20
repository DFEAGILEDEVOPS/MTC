'use strict'
const moment = require('moment')

const checkWindowErrorMessages = require('../../errors/check-window')
const XRegExp = require('xregexp')
const { isEmpty, isInt } = require('validator')

/**
 * Validates check window check end date data
 * @param {Object} validationError
 * @param {Object} checkEndDateData
 */
module.exports.validate = (validationError, checkEndDateData) => {
  const currentYear = moment.utc().format('YYYY')
  // Check end day
  const isCheckEndDayEmpty = isEmpty(checkEndDateData.checkEndDay.trim())
  if (isCheckEndDayEmpty) {
    validationError.addError('checkEndDay', checkWindowErrorMessages.checkEndDayRequired)
  }
  if (!isCheckEndDayEmpty && !isInt(checkEndDateData.checkEndDay, { min: 1, max: 31 })) {
    validationError.addError('checkEndDay', checkWindowErrorMessages.checkEndDayWrongDay)
  }
  if (!isCheckEndDayEmpty && !XRegExp('^[0-9]+$').test(checkEndDateData.checkEndDay)) {
    validationError.addError('checkEndDay', checkWindowErrorMessages.checkEndDayInvalidChars)
  }
  // Check end month
  const isCheckEndMonthEmpty = isEmpty(checkEndDateData.checkEndMonth.trim())
  if (isCheckEndMonthEmpty) {
    validationError.addError('checkEndMonth', checkWindowErrorMessages.checkEndMonthRequired)
  }
  if (!isCheckEndMonthEmpty && !isInt(checkEndDateData.checkEndMonth, { min: 1, max: 12 })) {
    validationError.addError('checkEndMonth', checkWindowErrorMessages.checkEndMonthWrongDay)
  }
  if (!isCheckEndMonthEmpty && !XRegExp('^[0-9]+$').test(checkEndDateData.checkEndMonth)) {
    validationError.addError('checkEndMonth', checkWindowErrorMessages.checkEndMonthInvalidChars)
  }
  // Check end year
  const isCheckEndYearEmpty = isEmpty(checkEndDateData.checkEndYear.trim())
  if (isCheckEndYearEmpty) {
    validationError.addError('checkEndYear', checkWindowErrorMessages.checkEndYearRequired)
  }
  if (!isCheckEndYearEmpty && !isInt(checkEndDateData.checkEndYear, { min: currentYear, max: (currentYear * 1 + 10) })) {
    validationError.addError('checkEndYear', checkWindowErrorMessages.checkEndYearWrongDay)
  }
  if (!isCheckEndYearEmpty && (!XRegExp('^[0-9]+$').test(checkEndDateData.checkEndYear) || checkEndDateData.checkEndYear.length !== 4)) {
    validationError.addError('checkEndYear', checkWindowErrorMessages.checkEndYearInvalidChars)
  }
}
