'use strict'
const checkWindowEditService = {}
const checkWindowDataService = require('./data-access/check-window.data.service')
const checkWindowEditValidator = require('../lib/validator/check-window/check-window-edit-validator')
const checkWindowService = require('./check-window.service')
const monitor = require('../helpers/monitor')

/**
 * Processes request data on editing
 * @param {Object} requestData
 */
checkWindowEditService.process = async (requestData) => {
  const existingCheckWindow = await checkWindowDataService.sqlFindOneByUrlSlug(requestData.urlSlug)
  const validationError = checkWindowEditValidator.validate(requestData, existingCheckWindow)
  if (validationError.hasError()) {
    throw validationError
  }
  await checkWindowService.submit(requestData, existingCheckWindow)
}
module.exports = monitor('check-window-edit.service', checkWindowEditService)
