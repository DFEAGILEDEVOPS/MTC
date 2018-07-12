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
  const hasEmptyAdminStartDateFields = R.any((x) => R.isNil(x) || R.isEmpty(x))(Object.values(adminStartDateData))
  if (!hasAdminStartDateInPast) {
    checkWindowAdminStartDateValidator.validate(validationError, adminStartDateData)
  }
  const checkStartDateData = R.pick(['checkStartDay', 'checkStartMonth', 'checkStartYear'], checkWindowData)
  const hasEmptyCheckStartDateFields = R.any((x) => R.isNil(x) || R.isEmpty(x))(Object.values(checkStartDateData))
  if (!hasCheckStartDateInPast) {
    checkWindowCheckStartDateValidator.validate(validationError, checkStartDateData)
  }
  const checkEndDateData = R.pick(['checkEndDay', 'checkEndMonth', 'checkEndYear'], checkWindowData)
  const hasEmptyCheckEndDateFields = R.any((x) => R.isNil(x) || R.isEmpty(x))(Object.values(checkEndDateData))
  checkWindowCheckEndDateValidator.validate(validationError, checkEndDateData)

  let adminStartDate = dateService.createUTCFromDayMonthYear(checkWindowData['adminStartDay'],
    checkWindowData['adminStartMonth'], checkWindowData['adminStartYear'])
  if (!adminStartDate && !hasAdminStartDateInPast && !hasEmptyAdminStartDateFields) {
    validationError.addError('adminDateInvalid', true)
  }
  let checkStartDate = dateService.createUTCFromDayMonthYear(checkWindowData['checkStartDay'],
    checkWindowData['checkStartMonth'], checkWindowData['checkStartYear'])
  if (!checkStartDate && !hasCheckStartDateInPast && !hasEmptyCheckStartDateFields) {
    validationError.addError('checkStartDateInvalid', true)
  }
  const checkEndDate = dateService.createUTCFromDayMonthYear(checkWindowData['checkEndDay'],
    checkWindowData['checkEndMonth'], checkWindowData['checkEndYear'])
  if (!checkEndDate && !hasEmptyCheckEndDateFields) {
    validationError.addError('checkEndDateInvalid', true)
  }

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
