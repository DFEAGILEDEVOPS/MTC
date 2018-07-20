'use strict'
const moment = require('moment')
const R = require('ramda')
const ValidationError = require('../../validation-error')
const checkWindowNameValidator = require('./check-window-name-validator')
const dateService = require('../../../services/date.service')
const checkWindowAdminStartDateValidator = require('./check-window-admin-start-date-validator')
const checkWindowCheckStartDateValidator = require('./check-window-check-start-date-validator')
const checkWindowCheckEndDateValidator = require('./check-window-check-end-date-validator')

/**
 * Validates check window data on edit
 * @param {Object} checkWindowData
 * @param {Object} existingCheckWindow
 * @returns {Object}
 */
module.exports.validate = (checkWindowData, existingCheckWindow) => {
  const hasAdminStartDateInPast = moment.utc().isAfter(existingCheckWindow.adminStartDate)
  const hasCheckStartDateInPast = moment.utc().isAfter(existingCheckWindow.checkStartDate)
  const validationError = new ValidationError()
  const checkWindowName = R.path(['checkWindowName'], checkWindowData)
  checkWindowNameValidator.validate(validationError, checkWindowName)
  const adminStartDateData = R.pick(['adminStartDay', 'adminStartMonth', 'adminStartYear'], checkWindowData)
  if (!hasAdminStartDateInPast) {
    checkWindowAdminStartDateValidator.validate(validationError, adminStartDateData)
  }
  const checkStartDateData = R.pick(['checkStartDay', 'checkStartMonth', 'checkStartYear'], checkWindowData)
  if (!hasCheckStartDateInPast) {
    checkWindowCheckStartDateValidator.validate(validationError, checkStartDateData)
  }
  const checkEndDateData = R.pick(['checkEndDay', 'checkEndMonth', 'checkEndYear'], checkWindowData)
  checkWindowCheckEndDateValidator.validate(validationError, checkEndDateData)

  let adminStartDate = dateService.createUTCFromDayMonthYear(checkWindowData['adminStartDay'],
    checkWindowData['adminStartMonth'], checkWindowData['adminStartYear'])
  let checkStartDate = dateService.createUTCFromDayMonthYear(checkWindowData['checkStartDay'],
    checkWindowData['checkStartMonth'], checkWindowData['checkStartYear'])
  const checkEndDate = dateService.createUTCFromDayMonthYear(checkWindowData['checkEndDay'],
    checkWindowData['checkEndMonth'], checkWindowData['checkEndYear'])

  // Compare date fields
  if (!hasAdminStartDateInPast && moment.utc().isAfter(adminStartDate)) {
    validationError.addError('adminDateInThePast', true)
  }
  adminStartDate = hasAdminStartDateInPast ? existingCheckWindow.adminStartDate : adminStartDate
  if (moment(adminStartDate).isAfter(checkStartDate) && !hasCheckStartDateInPast) {
    validationError.addError('checkDateBeforeAdminDate', true)
  }
  checkStartDate = hasCheckStartDateInPast ? existingCheckWindow.checkStartDate : checkStartDate
  if (!hasCheckStartDateInPast && moment.utc().isAfter(checkStartDate)) {
    validationError.addError('checkStartDateInThePast', true)
  }
  if (moment(checkStartDate).isAfter(checkEndDate) && !hasCheckStartDateInPast) {
    validationError.addError('checkStartDateAfterEndDate', true)
  }

  if (moment.utc().isAfter(checkEndDate)) {
    validationError.addError('checkEndDateInThePast', true)
  }
  if (moment(checkEndDate).isBefore(checkStartDate)) {
    validationError.addError('checkEndDateBeforeStartDate', true)
  }

  return validationError
}
