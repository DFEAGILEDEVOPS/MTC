'use strict'
const moment = require('moment')

const checkWindowErrorMessages = require('../../errors/new-check-window')
const dateService = require('../../../services/date.service')
const XRegExp = require('xregexp')
const { isEmpty, isInt } = require('validator')

/**
 * Validates check window admin start date data
 * @param {Object} validationError
 * @param {Object} adminStartDateData
 */
module.exports.validate = (validationError, adminStartDateData) => {
  const currentDate = moment.utc()
  const currentYear = currentDate.format('YYYY')
  const adminStartDate = dateService.createUTCFromDayMonthYear(adminStartDateData.adminStartDay,
    adminStartDateData.adminStartMonth, adminStartDateData.adminStartYear)
  const maxDaysInMonth = adminStartDate ? moment(adminStartDate).daysInMonth() : 31

  // Admin start day
  const isAdminStartDayEmpty = isEmpty(adminStartDateData.adminStartDay.trim())
  if (isAdminStartDayEmpty) {
    validationError.addError('adminStartDay', checkWindowErrorMessages.adminStartDayRequired)
  }
  if (!isAdminStartDayEmpty && !isInt(adminStartDateData.adminStartDay, { min: 1, max: maxDaysInMonth })) {
    validationError.addError('adminStartDay', checkWindowErrorMessages.adminStartDayWrongDay)
  }
  if (!isAdminStartDayEmpty && !XRegExp('^[1-9]\\d{0,1}$').test(parseInt(adminStartDateData.adminStartDay))) {
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
  if (!isAdminStartMonthEmpty && !XRegExp('^[1-9]\\d{0,1}$').test(parseInt(adminStartDateData.adminStartMonth))) {
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
  if (!isAdminStartYearEmpty && (!XRegExp('^[0-9]+$').test(adminStartDateData.adminStartYear) || adminStartDateData.adminStartYear.length !== 4)) {
    validationError.addError('adminStartYear', checkWindowErrorMessages.adminStartYearInvalidChars)
  }

  // Admin start date
  if (adminStartDate && moment(currentDate).isAfter(adminStartDate)) {
    validationError.addError('adminStartDateInThePast', true)
  }
  return validationError
}
