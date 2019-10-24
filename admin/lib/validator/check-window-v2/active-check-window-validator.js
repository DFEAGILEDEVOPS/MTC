'use strict'

const R = require('ramda')
const RA = require('ramda-adjunct')

const checkWindowErrorMessages = require('../../errors/check-window-v2')
const ValidationError = require('../../validation-error')

const activeCheckWindowValidator = {}

/**
 * Validates check window data against active check window
 * @param {Object} requestData
 * @param {Object} activeCheckWindow
 * @param {String} currentUrlSlug
 * @returns {Object} validation error
 */
activeCheckWindowValidator.validate = (requestData, activeCheckWindow, currentUrlSlug = undefined) => {
  const validationError = new ValidationError()
  if (RA.isNilOrEmpty(activeCheckWindow)) {
    return validationError
  }
  // Return if editing the current active check window
  if (R.equals(activeCheckWindow.urlSlug, currentUrlSlug)) {
    return validationError
  }
  const requestDates = R.pick([
    'adminStartDate',
    'adminEndDate',
    'familiarisationCheckStartDate',
    'familiarisationCheckEndDate',
    'checkStartDate',
    'checkEndDate'], requestData
  )
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
