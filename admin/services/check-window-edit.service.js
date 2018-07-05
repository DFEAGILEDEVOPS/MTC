'use strict'
const checkWindowEditService = {}
const checkWindowDataService = require('./data-access/check-window.data.service')
const checkWindowEditValidator = require('../lib/validator/check-window/check-window-edit-validator')
const checkWindowService = require('./check-window.service')

/**
 * Processes request data on editing
 * @param {Object} requestData
 */
checkWindowEditService.process = async (requestData) => {
  const checkWindow = await checkWindowDataService.sqlFindOneById(requestData.checkWindowId)
  const validationError = checkWindowEditValidator.validate(requestData, checkWindow)
  if (validationError.hasError()) {
    throw validationError
  }
  await checkWindowService.save(requestData)
}
module.exports = checkWindowEditService
