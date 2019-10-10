'use strict'

const serviceMessageService = require('../services/service-message.service')
const emptyFieldsValidator = require('../lib/validator/common/empty-fields-validators')
const serviceMessageErrorMessages = require('../lib/errors/service-message')

const serviceMessageProcessingService = {}

/**
 * Validate and store the service message data
 * @param {object} requestData
 * @returns {object}
 */
serviceMessageProcessingService.process = async (requestData) => {
  const { serviceMessageTitle, serviceMessageContent } = requestData
  const serviceMessageErrors = emptyFieldsValidator.validate([
    { fieldKey: 'serviceMessageTitle', fieldValue: serviceMessageTitle, errorMessage: serviceMessageErrorMessages.emptyServiceMessageTitle },
    { fieldKey: 'serviceMessageContent', fieldValue: serviceMessageContent, errorMessage: serviceMessageErrorMessages.emptyServiceMessageContent }
  ])
  if (serviceMessageErrors.hasError()) {
    return serviceMessageErrors
  }
  await serviceMessageService.setMessage(serviceMessageTitle, serviceMessageContent)
}

module.exports = serviceMessageProcessingService
