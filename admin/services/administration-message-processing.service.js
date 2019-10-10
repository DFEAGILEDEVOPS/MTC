'use strict'

const administrationMessageService = require('./administration-message.service')
const emptyFieldsValidator = require('../lib/validator/common/empty-fields-validators')
const serviceMessageErrorMessages = require('../lib/errors/service-message')

const administrationMessageProcessingService = {}

/**
 * Validates and stores the service message data
 * @param {object} requestData
 * @returns {object}
 */
administrationMessageProcessingService.submitServiceMessage = async (requestData) => {
  const { serviceMessageTitle, serviceMessageContent } = requestData
  const serviceMessageErrors = emptyFieldsValidator.validate([
    { fieldKey: 'serviceMessageTitle', fieldValue: serviceMessageTitle, errorMessage: serviceMessageErrorMessages.emptyServiceMessageTitle },
    { fieldKey: 'serviceMessageContent', fieldValue: serviceMessageContent, errorMessage: serviceMessageErrorMessages.emptyServiceMessageContent }
  ])
  if (serviceMessageErrors.hasError()) {
    return serviceMessageErrors
  }
  await administrationMessageService.setMessage(serviceMessageTitle, serviceMessageContent)
}

module.exports = administrationMessageProcessingService
