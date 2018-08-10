'use strict'

const checkWindowAddService = {}
const checkWindowService = require('./check-window.service')
const checkWindowAddValidator = require('../lib/validator/check-window/check-window-add-validator')
const monitor = require('../helpers/monitor')

/**
 * Processes request data on adding
 * @param {Object} requestData
 */
checkWindowAddService.process = async (requestData) => {
  const validationError = checkWindowAddValidator.validate(requestData)
  if (validationError.hasError()) {
    throw validationError
  }
  await checkWindowService.submit(requestData)
}
module.exports = monitor('check-window-add.service', checkWindowAddService)
