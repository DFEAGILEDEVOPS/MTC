'use strict'
const moment = require('moment')

const checkWindowErrorMessages = require('../../errors/new-check-window')
const dateService = require('../../../services/date.service')
const XRegExp = require('xregexp')
const { isEmpty, isInt } = require('validator')

/**
 * Validates check window live check end date data
 * @param {Object} validationError
 * @param {Object} liveCheckEndDateData
 */
module.exports.validate = (validationError, liveCheckEndDateData) => {
  const currentDate = moment.utc()
  const currentYear = currentDate.format('YYYY')
  const liveCheckEndDate = dateService.createUTCFromDayMonthYear(liveCheckEndDateData.liveCheckEndDay,
    liveCheckEndDateData.liveCheckEndMonth, liveCheckEndDateData.liveCheckEndYear)
  const maxDaysInMonth = liveCheckEndDate ? moment(liveCheckEndDate).daysInMonth() : 31

  // Live check end day
  const isLiveCheckEndDayEmpty = isEmpty(liveCheckEndDateData.liveCheckEndDay.trim())
  if (isLiveCheckEndDayEmpty) {
    validationError.addError('liveCheckEndDay', checkWindowErrorMessages.liveCheckEndDayRequired)
  }
  if (!isLiveCheckEndDayEmpty && !isInt(liveCheckEndDateData.liveCheckEndDay, { min: 1, max: maxDaysInMonth })) {
    validationError.addError('liveCheckEndDay', checkWindowErrorMessages.liveCheckEndDayWrongDay)
  }
  if (!isLiveCheckEndDayEmpty && !XRegExp('^[0-9]+$').test(liveCheckEndDateData.liveCheckEndDay)) {
    validationError.addError('liveCheckEndDay', checkWindowErrorMessages.liveCheckEndDayInvalidChars)
  }
  // Live check end month
  const isLiveCheckEndMonthEmpty = isEmpty(liveCheckEndDateData.liveCheckEndMonth.trim())
  if (isLiveCheckEndMonthEmpty) {
    validationError.addError('liveCheckEndMonth', checkWindowErrorMessages.liveCheckEndMonthRequired)
  }
  if (!isLiveCheckEndMonthEmpty && !isInt(liveCheckEndDateData.liveCheckEndMonth, { min: 1, max: 12 })) {
    validationError.addError('liveCheckEndMonth', checkWindowErrorMessages.liveCheckEndMonthWrongDay)
  }
  if (!isLiveCheckEndMonthEmpty && !XRegExp('^[0-9]+$').test(liveCheckEndDateData.liveCheckEndMonth)) {
    validationError.addError('liveCheckEndMonth', checkWindowErrorMessages.liveCheckEndMonthInvalidChars)
  }
  // Live check end year
  const isLiveCheckEndYearEmpty = isEmpty(liveCheckEndDateData.liveCheckEndYear.trim())
  if (isLiveCheckEndYearEmpty) {
    validationError.addError('liveCheckEndYear', checkWindowErrorMessages.liveCheckEndYearRequired)
  }
  if (!isLiveCheckEndYearEmpty && !isInt(liveCheckEndDateData.liveCheckEndYear, { min: currentYear, max: (currentYear * 1 + 10) })) {
    validationError.addError('liveCheckEndYear', checkWindowErrorMessages.liveCheckEndYearWrongDay)
  }
  if (!isLiveCheckEndYearEmpty && (!XRegExp('^[0-9]+$').test(liveCheckEndDateData.liveCheckEndYear) || liveCheckEndDateData.liveCheckEndYear.length !== 4)) {
    validationError.addError('liveCheckEndYear', checkWindowErrorMessages.liveCheckEndYearInvalidChars)
  }

  // Live check end date
  if (liveCheckEndDate && moment(currentDate).isAfter(liveCheckEndDate)) {
    validationError.addError('liveCheckEndDateInThePast', true)
  }
  return validationError
}
