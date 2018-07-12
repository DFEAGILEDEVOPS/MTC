'use strict'
const moment = require('moment')
const R = require('ramda')
const ValidationError = require('../../validation-error')
const dateService = require('../../../services/date.service')

const checkWindowNameValidator = require('./check-window-name-validator')
const checkWindowAdminStartDateValidator = require('./check-window-admin-start-date-validator')
const checkWindowCheckStartDateValidator = require('./check-window-check-start-date-validator')
const checkWindowCheckEndDateValidator = require('./check-window-check-end-date-validator')

/**
 * Validates check window data for first submission
 * @param {Object} checkWindowData
 * @returns {Object}
 */
module.exports.validate = (checkWindowData) => {
  const currentDate = moment.utc()

  const validationError = new ValidationError()
  const checkWindowName = R.path(['checkWindowName'], checkWindowData)
  checkWindowNameValidator.validate(validationError, checkWindowName)

  const adminStartDateData = R.pick(['adminStartDay', 'adminStartMonth', 'adminStartYear'], checkWindowData)
  checkWindowAdminStartDateValidator.validate(validationError, adminStartDateData)
  const hasEmptyAdminStartDateFields = R.any((x) => R.isNil(x) || R.isEmpty(x))(Object.values(adminStartDateData))

  const checkStartDateData = R.pick(['checkStartDay', 'checkStartMonth', 'checkStartYear'], checkWindowData)
  checkWindowCheckStartDateValidator.validate(validationError, checkStartDateData)
  const hasEmptyCheckStartDateFields = R.any((x) => R.isNil(x) || R.isEmpty(x))(Object.values(checkStartDateData))

  const checkEndDateData = R.pick(['checkEndDay', 'checkEndMonth', 'checkEndYear'], checkWindowData)
  checkWindowCheckEndDateValidator.validate(validationError, checkEndDateData)
  const hasEmptyCheckEndDateFields = R.any((x) => R.isNil(x) || R.isEmpty(x))(Object.values(checkEndDateData))

  const adminStartDate = dateService.createUTCFromDayMonthYear(checkWindowData['adminStartDay'],
    checkWindowData['adminStartMonth'], checkWindowData['adminStartYear'])
  if (!adminStartDate && !hasEmptyAdminStartDateFields) {
    validationError.addError('adminDateInvalid', true)
  }
  const checkStartDate = dateService.createUTCFromDayMonthYear(checkWindowData['checkStartDay'],
    checkWindowData['checkStartMonth'], checkWindowData['checkStartYear'])
  if (!checkStartDate && !hasEmptyCheckStartDateFields) {
    validationError.addError('checkStartDateInvalid', true)
  }
  const checkEndDate = dateService.createUTCFromDayMonthYear(checkWindowData['checkEndDay'],
    checkWindowData['checkEndMonth'], checkWindowData['checkEndYear'])
  if (!checkEndDate && !hasEmptyCheckEndDateFields) {
    validationError.addError('checkEndDateInvalid', true)
  }

  // Compare date fields
  if (adminStartDate && moment(currentDate).isAfter(adminStartDate)) {
    validationError.addError('adminDateInThePast', true)
  }
  if (adminStartDate && checkStartDate && moment(adminStartDate).isAfter(checkStartDate)) {
    validationError.addError('checkDateBeforeAdminDate', true)
  }
  if (checkStartDate && checkEndDate && moment(checkStartDate).isAfter(checkEndDate)) {
    validationError.addError('checkStartDateAfterEndDate', true)
  }
  if (checkStartDate && moment(currentDate).isAfter(checkStartDate)) {
    validationError.addError('checkStartDateInThePast', true)
  }
  if (checkEndDate && moment(currentDate).isAfter(checkEndDate)) {
    validationError.addError('checkEndDateInThePast', moment(currentDate).isAfter(checkEndDate))
  }
  if (checkEndDate && moment(checkEndDate).isBefore(checkStartDate)) {
    validationError.addError('checkEndDateBeforeStartDate', true)
  }
  return validationError
}
