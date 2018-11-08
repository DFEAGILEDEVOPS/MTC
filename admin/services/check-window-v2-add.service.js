'use strict'

const checkWindowDataService = require('./data-access/check-window.data.service')
const checkWindowAddValidator = require('../lib/validator/check-window-v2/check-window-add-validator')
const checkWindowV2Service = require('./check-window-v2.service')
const monitor = require('../helpers/monitor')

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
  const checkWindowData = checkWindowV2Service.prepareSubmissionData(requestData)
  return checkWindowDataService.sqlCreate(checkWindowData)
}

module.exports = checkWindowV2AddService
