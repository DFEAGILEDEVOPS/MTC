'use strict'
const moment = require('moment')

const checkWindowErrorMessages = require('../../errors/new-check-window')
const dateService = require('../../../services/date.service')
const XRegExp = require('xregexp')
const { isEmpty, isInt } = require('validator')

/**
 * Validates check window admin end date data
 * @param {Object} validationError
 * @param {Object} adminEndDateData
 */
module.exports.validate = (validationError, adminEndDateData) => {
  const currentDate = moment.utc()
  const currentYear = currentDate.format('YYYY')
  const adminEndDate = dateService.createUTCFromDayMonthYear(adminEndDateData.adminEndDay,
    adminEndDateData.adminEndMonth, adminEndDateData.adminEndYear)

  // Admin end day
  const isAdminEndDayEmpty = isEmpty(adminEndDateData.adminEndDay.trim())
  if (isAdminEndDayEmpty) {
    validationError.addError('adminEndDay', checkWindowErrorMessages.adminEndDayRequired)
  }
  if (!isAdminEndDayEmpty && !isInt(adminEndDateData.adminEndDay, { min: 1, max: 31 })) {
    validationError.addError('adminEndDay', checkWindowErrorMessages.adminEndDayWrongDay)
  }
  if (!isAdminEndDayEmpty && !XRegExp('^[0-9]+$').test(adminEndDateData.adminEndDay)) {
    validationError.addError('adminEndDay', checkWindowErrorMessages.adminEndDayInvalidChars)
  }
  // Admin end month
  const isAdminEndMonthEmpty = isEmpty(adminEndDateData.adminEndMonth.trim())
  if (isAdminEndMonthEmpty) {
    validationError.addError('adminEndMonth', checkWindowErrorMessages.adminEndMonthRequired)
  }
  if (!isAdminEndMonthEmpty && !isInt(adminEndDateData.adminEndMonth, { min: 1, max: 12 })) {
    validationError.addError('adminEndMonth', checkWindowErrorMessages.adminEndMonthWrongDay)
  }
  if (!isAdminEndMonthEmpty && !XRegExp('^[0-9]+$').test(adminEndDateData.adminEndMonth)) {
    validationError.addError('adminEndMonth', checkWindowErrorMessages.adminEndMonthInvalidChars)
  }
  // Admin end year
  const isAdminEndYearEmpty = isEmpty(adminEndDateData.adminEndYear.trim())
  if (isAdminEndYearEmpty) {
    validationError.addError('adminEndYear', checkWindowErrorMessages.adminEndYearRequired)
  }
  if (!isAdminEndYearEmpty && !isInt(adminEndDateData.adminEndYear, { min: currentYear, max: (currentYear * 1 + 10) })) {
    validationError.addError('adminEndYear', checkWindowErrorMessages.adminEndYearWrongDay)
  }
  if (!isAdminEndYearEmpty && (!XRegExp('^[0-9]+$').test(adminEndDateData.adminEndYear) || adminEndDateData.adminEndYear.length !== 4)) {
    validationError.addError('adminEndYear', checkWindowErrorMessages.adminEndYearInvalidChars)
  }

  // Admin end date
  if (adminEndDate && moment(currentDate).isAfter(adminEndDate)) {
    validationError.addError('adminEndDateInThePast', true)
  }
  return validationError
}
