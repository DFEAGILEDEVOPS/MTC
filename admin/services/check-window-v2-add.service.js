'use strict'

const checkWindowDataService = require('./data-access/check-window.data.service')
const checkWindowAddValidator = require('../lib/validator/check-window-v2/check-window-add-validator')
const checkWindowHelper = require('../helpers/check-window')
const monitor = require('../helpers/monitor')

const checkWindowV2AddService = {}

/**
 * Submit request data on adding
 * @param {Object} requestData
 * @returns {String} flash message for successful db insertion
 */
checkWindowV2AddService.submit = async (requestData) => {
  const validationError = checkWindowAddValidator.validate(requestData)
  if (validationError.hasError()) {
    throw validationError
  }
  const checkWindowData = checkWindowHelper.prepareSubmissionData(requestData)
  await checkWindowDataService.sqlCreate(checkWindowData)
  return `${checkWindowData.name} has been created`
}

module.exports = monitor('check-window-add.service', checkWindowV2AddService)
