'use strict'

const R = require('ramda')

const checkWindowErrorMessages = require('../../errors/check-window-v2')
const ValidationError = require('../../validation-error')

const activeCheckWindowValidator = {}

/**
 * Validates check window data against active check window
 * @param {Object} requestData
 * @param {Object} activeCheckWindow
 * @returns {Object} validation error
 */
activeCheckWindowValidator.validate = (requestData, activeCheckWindow) => {
  const validationError = new ValidationError()
  if (!activeCheckWindow || Object.keys(activeCheckWindow).length === 0) {
    return validationError
  }
  // Return if editing the current active check window
  if (R.equals(activeCheckWindow.urlSlug, requestData.urlSlug)) {
    return validationError
  }
  const requestDates = R.pick([
    'adminStartDate',
    'adminEndDate',
    'familiarisationCheckStartDate',
    'familiarisationCheckEndDate',
    'checkStartDate',
    'checkEndDate'], requestData)
  R.forEach(dt => {
    if (dt.isBetween(activeCheckWindow.adminStartDate, activeCheckWindow.adminEndDate, null, '[]')) {
      validationError.addError('withinActiveCheckWindowAdminDateRage', checkWindowErrorMessages.withinActiveCheckWindowAdminDateRage)
    }
    if (dt.isBetween(activeCheckWindow.familiarisationCheckStartDate, activeCheckWindow.familiarisationCheckEndDate, null, '()')) {
      validationError.addError('withinActiveCheckWindowFamiliarisationDateRage', checkWindowErrorMessages.withinActiveCheckWindowFamiliarisationDateRage)
    }
    if (dt.isBetween(activeCheckWindow.checkStartDate, activeCheckWindow.checkEndDate, null, '()')) {
      validationError.addError('withinActiveCheckWindowLiveDateRage', checkWindowErrorMessages.withinActiveCheckWindowLiveDateRage)
    }
  }, R.values(requestDates))
  return validationError
}

module.exports = activeCheckWindowValidator
