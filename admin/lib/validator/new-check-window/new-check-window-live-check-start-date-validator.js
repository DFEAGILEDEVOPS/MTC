'use strict'
const moment = require('moment')

const checkWindowErrorMessages = require('../../errors/new-check-window')
const dateService = require('../../../services/date.service')
const XRegExp = require('xregexp')
const { isEmpty, isInt } = require('validator')

/**
 * Validates check window live check start date data
 * @param {Object} validationError
 * @param {Object} liveCheckStartDateData
 */
module.exports.validate = (validationError, liveCheckStartDateData) => {
  const currentDate = moment.utc()
  const currentYear = currentDate.format('YYYY')
  const liveCheckStartDate = dateService.createUTCFromDayMonthYear(liveCheckStartDateData.liveCheckStartDay,
    liveCheckStartDateData.liveCheckStartMonth, liveCheckStartDateData.liveCheckStartYear)
  const maxDaysInMonth = liveCheckStartDate ? moment(liveCheckStartDate).daysInMonth() : 31

  // Live check start day
  const isLiveCheckStartDayEmpty = isEmpty(liveCheckStartDateData.liveCheckStartDay.trim())
  if (isLiveCheckStartDayEmpty) {
    validationError.addError('liveCheckStartDay', checkWindowErrorMessages.liveCheckStartDayRequired)
  }
  if (!isLiveCheckStartDayEmpty && !isInt(liveCheckStartDateData.liveCheckStartDay, { min: 1, max: maxDaysInMonth })) {
    validationError.addError('liveCheckStartDay', checkWindowErrorMessages.liveCheckStartDayWrongDay)
  }
  if (!isLiveCheckStartDayEmpty && !XRegExp('^[1-9]\\d{0,1}$').test(parseInt(liveCheckStartDateData.liveCheckStartDay))) {
    validationError.addError('liveCheckStartDay', checkWindowErrorMessages.liveCheckStartDayInvalidChars)
  }
  // Live check start month
  const isLiveCheckStartMonthEmpty = isEmpty(liveCheckStartDateData.liveCheckStartMonth.trim())
  if (isLiveCheckStartMonthEmpty) {
    validationError.addError('liveCheckStartMonth', checkWindowErrorMessages.liveCheckStartMonthRequired)
  }
  if (!isLiveCheckStartMonthEmpty && !isInt(liveCheckStartDateData.liveCheckStartMonth, { min: 1, max: 12 })) {
    validationError.addError('liveCheckStartMonth', checkWindowErrorMessages.liveCheckStartMonthWrongDay)
  }
  if (!isLiveCheckStartMonthEmpty && !XRegExp('^[1-9]\\d{0,1}$').test(parseInt(liveCheckStartDateData.liveCheckStartMonth))) {
    validationError.addError('liveCheckStartMonth', checkWindowErrorMessages.liveCheckStartMonthInvalidChars)
  }
  // Live check start year
  const isLiveCheckStartYearEmpty = isEmpty(liveCheckStartDateData.liveCheckStartYear.trim())
  if (isLiveCheckStartYearEmpty) {
    validationError.addError('liveCheckStartYear', checkWindowErrorMessages.liveCheckStartYearRequired)
  }
  if (!isLiveCheckStartYearEmpty && !isInt(liveCheckStartDateData.liveCheckStartYear, { min: currentYear, max: (currentYear * 1 + 10) })) {
    validationError.addError('liveCheckStartYear', checkWindowErrorMessages.liveCheckStartYearWrongDay)
  }
  if (!isLiveCheckStartYearEmpty && (!XRegExp('^[0-9]+$').test(liveCheckStartDateData.liveCheckStartYear) || liveCheckStartDateData.liveCheckStartYear.length !== 4)) {
    validationError.addError('liveCheckStartYear', checkWindowErrorMessages.liveCheckStartYearInvalidChars)
  }

  // Live check start date
  if (liveCheckStartDate && moment(currentDate).isAfter(liveCheckStartDate)) {
    validationError.addError('liveCheckStartDateInThePast', true)
  }
  return validationError
}
