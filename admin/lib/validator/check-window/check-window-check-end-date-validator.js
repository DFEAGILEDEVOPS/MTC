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
  if (isEmpty(checkEndDateData.checkEndDay.trim())) {
    validationError.addError('checkEndDay', checkWindowErrorMessages.checkEndDayRequired)
  }
  if (!isInt(checkEndDateData.checkEndDay, { min: 1, max: 31 })) {
    validationError.addError('checkEndDay', checkWindowErrorMessages.checkEndDayWrongDay)
  }
  if (!XRegExp('^[0-9]+$').test(checkEndDateData.checkEndDay)) {
    validationError.addError('checkEndDay', checkWindowErrorMessages.checkEndDayInvalidChars)
  }
  // Check end month
  if (isEmpty(checkEndDateData.checkEndMonth.trim())) {
    validationError.addError('checkEndMonth', checkWindowErrorMessages.checkEndMonthRequired)
  }
  if (!isInt(checkEndDateData.checkEndMonth, { min: 1, max: 12 })) {
    validationError.addError('checkEndMonth', checkWindowErrorMessages.checkEndMonthWrongDay)
  }
  if (!XRegExp('^[0-9]+$').test(checkEndDateData.checkEndMonth)) {
    validationError.addError('checkEndMonth', checkWindowErrorMessages.checkEndMonthInvalidChars)
  }
  // Check end year
  if (isEmpty(checkEndDateData.checkEndYear.trim())) {
    validationError.addError('checkEndYear', checkWindowErrorMessages.checkEndYearRequired)
  }
  if (!isInt(checkEndDateData.checkEndYear, { min: currentYear, max: (currentYear * 1 + 10) })) {
    validationError.addError('checkEndYear', checkWindowErrorMessages.checkEndYearWrongDay)
  }
  if (checkEndDateData.checkEndYear.length !== 4) {
    validationError.addError('checkEndYear', checkWindowErrorMessages.enterValidYear)
  }
  if (!XRegExp('^[0-9]+$').test(checkEndDateData.checkEndYear)) {
    validationError.addError('checkEndYear', checkWindowErrorMessages.checkEndYearInvalidChars)
  }
}
