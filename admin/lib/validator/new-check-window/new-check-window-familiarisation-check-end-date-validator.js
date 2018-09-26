'use strict'
const moment = require('moment')

const checkWindowErrorMessages = require('../../errors/new-check-window')
const dateService = require('../../../services/date.service')
const XRegExp = require('xregexp')
const { isEmpty, isInt } = require('validator')

/**
 * Validates check window familiarisation check end date data
 * @param {Object} validationError
 * @param {Object} familiarisationCheckEndDateData
 */
module.exports.validate = (validationError, familiarisationCheckEndDateData) => {
  const currentDate = moment.utc()
  const currentYear = currentDate.format('YYYY')
  const familiarisationCheckEndDate = dateService.createUTCFromDayMonthYear(familiarisationCheckEndDateData.familiarisationCheckEndDay,
    familiarisationCheckEndDateData.familiarisationCheckEndMonth, familiarisationCheckEndDateData.familiarisationCheckEndYear)
  const maxDaysInMonth = familiarisationCheckEndDate ? moment(familiarisationCheckEndDate).daysInMonth() : 31

  // Familiarisation check end day
  const isFamiliarisationCheckEndDayEmpty = isEmpty(familiarisationCheckEndDateData.familiarisationCheckEndDay.trim())
  if (isFamiliarisationCheckEndDayEmpty) {
    validationError.addError('familiarisationCheckEndDay', checkWindowErrorMessages.familiarisationCheckEndDayRequired)
  }
  if (!isFamiliarisationCheckEndDayEmpty && !isInt(familiarisationCheckEndDateData.familiarisationCheckEndDay, { min: 1, max: maxDaysInMonth })) {
    validationError.addError('familiarisationCheckEndDay', checkWindowErrorMessages.familiarisationCheckEndDayWrongDay)
  }
  if (!isFamiliarisationCheckEndDayEmpty && !XRegExp('^[1-9]\\d{0,1}$').test(parseInt(familiarisationCheckEndDateData.familiarisationCheckEndDay))) {
    validationError.addError('familiarisationCheckEndDay', checkWindowErrorMessages.familiarisationCheckEndDayInvalidChars)
  }
  // Familiarisation check end month
  const isFamiliarisationCheckEndMonthEmpty = isEmpty(familiarisationCheckEndDateData.familiarisationCheckEndMonth.trim())
  if (isFamiliarisationCheckEndMonthEmpty) {
    validationError.addError('familiarisationCheckEndMonth', checkWindowErrorMessages.familiarisationCheckEndMonthRequired)
  }
  if (!isFamiliarisationCheckEndMonthEmpty && !isInt(familiarisationCheckEndDateData.familiarisationCheckEndMonth, { min: 1, max: 12 })) {
    validationError.addError('familiarisationCheckEndMonth', checkWindowErrorMessages.familiarisationCheckEndMonthWrongDay)
  }
  if (!isFamiliarisationCheckEndMonthEmpty && !XRegExp('^[1-9]\\d{0,1}$').test(parseInt(familiarisationCheckEndDateData.familiarisationCheckEndMonth))) {
    validationError.addError('familiarisationCheckEndMonth', checkWindowErrorMessages.familiarisationCheckEndMonthInvalidChars)
  }
  // Familiarisation check end year
  const isFamiliarisationCheckEndYearEmpty = isEmpty(familiarisationCheckEndDateData.familiarisationCheckEndYear.trim())
  if (isFamiliarisationCheckEndYearEmpty) {
    validationError.addError('familiarisationCheckEndYear', checkWindowErrorMessages.familiarisationCheckEndYearRequired)
  }
  if (!isFamiliarisationCheckEndYearEmpty && !isInt(familiarisationCheckEndDateData.familiarisationCheckEndYear, { min: currentYear, max: (currentYear * 1 + 10) })) {
    validationError.addError('familiarisationCheckEndYear', checkWindowErrorMessages.familiarisationCheckEndYearWrongDay)
  }
  if (!isFamiliarisationCheckEndYearEmpty && (!XRegExp('^[0-9]+$').test(familiarisationCheckEndDateData.familiarisationCheckEndYear) || familiarisationCheckEndDateData.familiarisationCheckEndYear.length !== 4)) {
    validationError.addError('familiarisationCheckEndYear', checkWindowErrorMessages.familiarisationCheckEndYearInvalidChars)
  }

  // Familiarisation check end date
  if (familiarisationCheckEndDate && moment(currentDate).isAfter(familiarisationCheckEndDate)) {
    validationError.addError('familiarisationCheckEndDateInThePast', true)
  }
  return validationError
}
