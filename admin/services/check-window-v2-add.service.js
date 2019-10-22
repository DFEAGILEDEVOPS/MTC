'use strict'

const checkWindowDataService = require('./data-access/check-window.data.service')
const checkWindowAddValidator = require('../lib/validator/check-window-v2/check-window-add-validator')
const activeCheckWindowValidator = require('../lib/validator/check-window-v2/active-check-window-validator')
const checkWindowV2Service = require('./check-window-v2.service')

const checkWindowV2AddService = {}

/**
 * Submit request data on adding
 * @param {Object} requestData
 * @returns {Promise} db insertion
 */
checkWindowV2AddService.submit = async (requestData) => {
  const validationError = checkWindowAddValidator.validate(requestData)
  if (validationError.hasError()) {
    throw validationError
  }
  const activeCheckWindowData = await checkWindowDataService.sqlFindActiveCheckWindow()
  const checkWindowData = checkWindowV2Service.prepareSubmissionData(requestData)
  const activeCheckWindowValidationError = activeCheckWindowValidator.validate(checkWindowData, activeCheckWindowData)
  if (activeCheckWindowValidationError.hasError()) {
    throw activeCheckWindowValidationError
  }
  return checkWindowDataService.sqlCreate(checkWindowData)
}

module.exports = checkWindowV2AddService
