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
  let adminStartDate
  let checkStartDate
  let checkEndDate
  const currentDate = moment.utc().format('YYYY-MM-D')

  const validationError = new ValidationError()
  const checkWindowName = R.pick(['checkWindowName'], checkWindowData)
  checkWindowNameValidator.validate(validationError, checkWindowName)

  const adminStartDateData = R.pick(['adminStartDay', 'adminStartMonth', 'adminStartYear'], checkWindowData)
  checkWindowAdminStartDateValidator.validate(validationError, adminStartDateData)
  const checkStartDateData = R.pick(['checkStartDay', 'checkStartMonth', 'checkStartYear'], checkWindowData)
  checkWindowCheckStartDateValidator.validate(validationError, checkStartDateData)
  const checkEndDateData = R.pick(['checkEndDay', 'checkEndMonth', 'checkEndYear'], checkWindowData)
  checkWindowCheckEndDateValidator.validate(validationError, checkEndDateData)

  adminStartDate = dateService.createUTCFromDayMonthYear(checkWindowData['adminStartDay'],
    checkWindowData['adminStartMonth'], checkWindowData['adminStartYear'])
  if (!adminStartDate) {
    validationError.addError('adminDateInvalid', true)
  }
  checkStartDate = dateService.createUTCFromDayMonthYear(checkWindowData['checkStartDay'],
    checkWindowData['checkStartMonth'], checkWindowData['checkStartYear'])
  if (!checkStartDate) {
    validationError.addError('checkStartDateInvalid', true)
  }
  checkEndDate = dateService.createUTCFromDayMonthYear(checkWindowData['checkEndDay'],
    checkWindowData['checkEndMonth'], checkWindowData['checkEndYear'])
  if (checkEndDate !== undefined && checkEndDate.isValid() === false) {
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

  if (!checkEndDate) {
    return validationError
  }
  if (moment(checkEndDate).isBefore(checkStartDate)) {
    validationError.addError('checkEndDateBeforeStartDate', true)
  }
  if (moment(currentDate).isAfter(checkEndDate)) {
    validationError.addError('checkEndDateInThePast', true)
  }
  return validationError
}
