'use strict'

const newCheckWindowAddService = {}
const newCheckWindowAddValidator = require('../lib/validator/new-check-window/new-check-window-add-validator')
const monitor = require('../helpers/monitor')

/**
 * Processes request data on adding
 * @param {Object} requestData
 */
newCheckWindowAddService.process = async (requestData) => {
  const validationError = newCheckWindowAddValidator.validate(requestData)
  if (validationError.hasError()) {
    throw validationError
  }
}
module.exports = monitor('check-window-add.service', newCheckWindowAddService)
