'use strict'

const R = require('ramda')
const RA = require('ramda-adjunct')

const dateService = require('../../../services/date.service')
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
    if (dateService.isBetween(dt, activeCheckWindow.adminStartDate, activeCheckWindow.adminEndDate, null, true)) {
      validationError.addError('withinActiveCheckWindowAdminDateRage', checkWindowErrorMessages.withinActiveCheckWindowAdminDateRage)
    }
    if (dateService.isBetween(dt, activeCheckWindow.familiarisationCheckStartDate, activeCheckWindow.familiarisationCheckEndDate, null, true)) {
      validationError.addError('withinActiveCheckWindowFamiliarisationDateRage', checkWindowErrorMessages.withinActiveCheckWindowFamiliarisationDateRage)
    }
    if (dateService.isBetween(dt, activeCheckWindow.checkStartDate, activeCheckWindow.checkEndDate, null, true)) {
      validationError.addError('withinActiveCheckWindowLiveDateRage', checkWindowErrorMessages.withinActiveCheckWindowLiveDateRage)
    }
  }, R.values(requestDates))
  return validationError
}

module.exports = activeCheckWindowValidator
