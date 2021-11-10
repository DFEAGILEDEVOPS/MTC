'use strict'

const administrationMessageDataService = require('./data-access/administration-message.data.service')
const redisCacheService = require('./data-access/redis-cache.service')
const emptyFieldsValidator = require('../lib/validator/common/empty-fields-validators')
const serviceMessageErrorMessages = require('../lib/errors/service-message')
const { marked } = require('marked')
const logService = require('./log.service')
const logger = logService.getLogger()

const administrationMessageService = {}
const serviceMessageRedisKey = 'serviceMessage'

/**
 * Fetch the service message from DB or cache with the message property as raw markdown, or plain text.
 * @returns {Promise<{ title: string, message: string }>}
 */
administrationMessageService.fetchMessage = async function fetchServiceMessage () {
  let cachedServiceMessage
  const result = await redisCacheService.get(serviceMessageRedisKey)
  try {
    cachedServiceMessage = JSON.parse(result)
    if (cachedServiceMessage) {
      return cachedServiceMessage
    }
  } catch (ignore) {}
  return administrationMessageDataService.sqlFindActiveServiceMessage()
}

/**
 * Get the current service message
 * @returns {Promise<any>}
 */
administrationMessageService.getMessage = async () => {
  let html
  let rawMessage // object with .message => markdown
  try {
    rawMessage = await administrationMessageService.fetchMessage()
    html = marked.parse(rawMessage.message)
  } catch (error) {
    logger.alert(`serviceMessage: failed to render.  Error: ${error.message}`)
    return undefined // show the page at least, without the service message
  }
  // TODO: sanitise output
  return { title: rawMessage.title, message: html }
}

/**
 * Validates and stores the service message data
 * @param {object} requestData
 * @param {number} userId
 * @returns {Promise<*>}
 */
administrationMessageService.setMessage = async (requestData, userId) => {
  if (!userId) {
    throw new Error('User id not found in session')
  }
  const { serviceMessageTitle, serviceMessageContent } = requestData
  const serviceMessageErrors = emptyFieldsValidator.validate([
    { fieldKey: 'serviceMessageTitle', fieldValue: serviceMessageTitle, errorMessage: serviceMessageErrorMessages.emptyServiceMessageTitle },
    { fieldKey: 'serviceMessageContent', fieldValue: serviceMessageContent, errorMessage: serviceMessageErrorMessages.emptyServiceMessageContent }
  ])
  if (serviceMessageErrors.hasError()) {
    return serviceMessageErrors
  }

  const serviceMessageData = administrationMessageService.prepareSubmissionData(requestData, userId)

  await administrationMessageDataService.sqlCreate(serviceMessageData)
  return redisCacheService.set(serviceMessageRedisKey, serviceMessageData)
}

/**
 * Prepare the service message data for sql transmission
 * @param {object} requestData
 * @param {number} userId
 * @returns {Object}
 */
administrationMessageService.prepareSubmissionData = (requestData, userId) => {
  const serviceMessageData = {}
  serviceMessageData.createdByUser_id = userId
  serviceMessageData.title = requestData.serviceMessageTitle
  serviceMessageData.message = requestData.serviceMessageContent
  return serviceMessageData
}

/**
 * Drops the service message
 * @returns {Promise<*>}
 */
administrationMessageService.dropMessage = async (userId) => {
  if (!userId) {
    throw new Error('User id not found in session')
  }
  await administrationMessageDataService.sqlDeleteServiceMessage()
  return redisCacheService.drop(serviceMessageRedisKey)
}

module.exports = administrationMessageService
