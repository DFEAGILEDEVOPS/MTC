'use strict'

const redisCacheService = require('../services/redis-cache.service')
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
  const redisKey = 'serviceMessage'
  const serviceMessage = {
    serviceMessageTitle,
    serviceMessageContent
  }
  return redisCacheService.set(redisKey, serviceMessage)
}

module.exports = serviceMessageProcessingService
