'use strict'
const moment = require('moment')

const checkWindowErrorMessages = require('../../errors/new-check-window')
const dateService = require('../../../services/date.service')
const XRegExp = require('xregexp')
const { isEmpty, isInt } = require('validator')

/**
 * Validates check window familiarisation check start date data
 * @param {Object} validationError
 * @param {Object} familiarisationCheckStartDateData
 */
module.exports.validate = (validationError, familiarisationCheckStartDateData) => {
  const currentDate = moment.utc()
  const currentYear = currentDate.format('YYYY')
  const familiarisationCheckStartDate = dateService.createUTCFromDayMonthYear(familiarisationCheckStartDateData.familiarisationCheckStartDay,
    familiarisationCheckStartDateData.familiarisationCheckStartMonth, familiarisationCheckStartDateData.familiarisationCheckStartYear)
  const maxDaysInMonth = familiarisationCheckStartDate ? moment(familiarisationCheckStartDate).daysInMonth() : 31

  // Familiarisation check start day
  const isFamiliarisationCheckStartDayEmpty = isEmpty(familiarisationCheckStartDateData.familiarisationCheckStartDay.trim())
  if (isFamiliarisationCheckStartDayEmpty) {
    validationError.addError('familiarisationCheckStartDay', checkWindowErrorMessages.familiarisationCheckStartDayRequired)
  }
  if (!isFamiliarisationCheckStartDayEmpty && !isInt(familiarisationCheckStartDateData.familiarisationCheckStartDay, { min: 1, max: maxDaysInMonth })) {
    validationError.addError('familiarisationCheckStartDay', checkWindowErrorMessages.familiarisationCheckStartDayWrongDay)
  }
  if (!isFamiliarisationCheckStartDayEmpty && !XRegExp('^[0-9]+$').test(familiarisationCheckStartDateData.familiarisationCheckStartDay)) {
    validationError.addError('familiarisationCheckStartDay', checkWindowErrorMessages.familiarisationCheckStartDayInvalidChars)
  }
  // Familiarisation check start month
  const isFamiliarisationCheckStartMonthEmpty = isEmpty(familiarisationCheckStartDateData.familiarisationCheckStartMonth.trim())
  if (isFamiliarisationCheckStartMonthEmpty) {
    validationError.addError('familiarisationCheckStartMonth', checkWindowErrorMessages.familiarisationCheckStartMonthRequired)
  }
  if (!isFamiliarisationCheckStartMonthEmpty && !isInt(familiarisationCheckStartDateData.familiarisationCheckStartMonth, { min: 1, max: 12 })) {
    validationError.addError('familiarisationCheckStartMonth', checkWindowErrorMessages.familiarisationCheckStartMonthWrongDay)
  }
  if (!isFamiliarisationCheckStartMonthEmpty && !XRegExp('^[0-9]+$').test(familiarisationCheckStartDateData.familiarisationCheckStartMonth)) {
    validationError.addError('familiarisationCheckStartMonth', checkWindowErrorMessages.familiarisationCheckStartMonthInvalidChars)
  }
  // Familiarisation check start year
  const isFamiliarisationCheckStartYearEmpty = isEmpty(familiarisationCheckStartDateData.familiarisationCheckStartYear.trim())
  if (isFamiliarisationCheckStartYearEmpty) {
    validationError.addError('familiarisationCheckStartYear', checkWindowErrorMessages.familiarisationCheckStartYearRequired)
  }
  if (!isFamiliarisationCheckStartYearEmpty && !isInt(familiarisationCheckStartDateData.familiarisationCheckStartYear, { min: currentYear, max: (currentYear * 1 + 10) })) {
    validationError.addError('familiarisationCheckStartYear', checkWindowErrorMessages.familiarisationCheckStartYearWrongDay)
  }
  if (!isFamiliarisationCheckStartYearEmpty && (!XRegExp('^[0-9]+$').test(familiarisationCheckStartDateData.familiarisationCheckStartYear) || familiarisationCheckStartDateData.familiarisationCheckStartYear.length !== 4)) {
    validationError.addError('familiarisationCheckStartYear', checkWindowErrorMessages.familiarisationCheckStartYearInvalidChars)
  }

  // Familiarisation check start date
  if (familiarisationCheckStartDate && moment(currentDate).isAfter(familiarisationCheckStartDate)) {
    validationError.addError('familiarisationCheckStartDateInThePast', true)
  }
  return validationError
}
