'use strict'

const moment = require('moment')

const checkWindowDataService = require('./data-access/check-window.data.service')
const checkWindowAddValidator = require('../lib/validator/check-window-v2/check-window-add-validator')
const activeCheckWindowValidator = require('../lib/validator/check-window-v2/active-check-window-validator')
const checkWindowV2Service = require('./check-window-v2.service')

const checkWindowV2UpdateService = {}

/**
 * Submit request data on updating
 * @param {Object} requestData
 * @returns {Promise} db update
 */
checkWindowV2UpdateService.submit = async (requestData) => {
  const checkWindow = await checkWindowV2Service.getCheckWindow(requestData.checkWindowUrlSlug)
  const validationConfig = checkWindowV2UpdateService.getValidationConfig(checkWindow)
  const checkWindowAddValidationError = checkWindowAddValidator.validate(requestData, validationConfig)
  if (checkWindowAddValidationError.hasError()) {
    throw checkWindowAddValidationError
  }
  const checkWindowData = checkWindowV2Service.prepareSubmissionData(requestData, checkWindow.id)
  const activeCheckWindowData = await checkWindowDataService.sqlFindActiveCheckWindow()
  const activeCheckWindowValidationError = activeCheckWindowValidator.validate(checkWindowData, activeCheckWindowData, requestData.checkWindowUrlSlug)
  if (activeCheckWindowValidationError.hasError()) {
    throw activeCheckWindowValidationError
  }
  return checkWindowDataService.sqlUpdate(checkWindowData)
}

/**
 * Get validation config for validating existing check window
 * @param {Object} checkWindow
 * @returns {Object} validation config
 */

checkWindowV2UpdateService.getValidationConfig = (checkWindow) => {
  const config = {}
  const currentDate = moment.utc()
  config.adminStartDateDisabled = currentDate.isAfter(checkWindow.adminStartDate, 'days')
  config.adminEndDateDisabled = currentDate.isAfter(checkWindow.adminEndDate, 'days')
  config.familiarisationCheckStartDateDisabled = currentDate.isAfter(checkWindow.familiarisationCheckStartDate, 'days')
  config.familiarisationCheckEndDateDisabled = currentDate.isAfter(checkWindow.familiarisationCheckEndDate, 'days')
  config.liveCheckStartDateDisabled = currentDate.isAfter(checkWindow.checkStartDate, 'days')
  config.liveCheckEndDateDisabled = currentDate.isAfter(checkWindow.checkEndDate, 'days')
  return config
}

module.exports = checkWindowV2UpdateService
