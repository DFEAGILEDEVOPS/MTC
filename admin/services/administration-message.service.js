'use strict'
const { marked } = require('marked')

const administrationMessageDataService = require('./data-access/administration-message.data.service')
const redisCacheService = require('./data-access/redis-cache.service')
const emptyFieldsValidator = require('../lib/validator/common/empty-fields-validators')
const serviceMessageErrorMessages = require('../lib/errors/service-message')
const logService = require('./log.service')
const logger = logService.getLogger()
const sanitiseService = require('./sanitise.service')
const redisKeyService = require('./redis-key.service')

const administrationMessageService = {}
const serviceMessageRedisKey = redisKeyService.getServiceMessageKey()

/**
 * @typedef serviceMessage
 * @property message string
 * @property title string
 * @property borderColourCode string
 * @property [id] number optional
 */

/**
 * Fetch the service message from DB or cache with the message property as raw markdown, or plain text.
 * @returns {Promise<serviceMessage | undefined>}
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
 * @returns {Promise<serviceMessage | undefined>}
 */
administrationMessageService.getMessage = async () => {
  let html
  let rawMessage // object with .message => markdown
  try {
    rawMessage = await administrationMessageService.fetchMessage()
    if (rawMessage === undefined) {
      return undefined
    }
    html = marked.parse(rawMessage.message)
  } catch (error) {
    logger.alert(`serviceMessage: failed to render.  Error: ${error.message}`)
    return undefined // show the page at least, without the service message
  }
  const cleanMessage = sanitiseService.sanitise(html)
  return { title: rawMessage.title, message: cleanMessage, borderColourCode: rawMessage.borderColourCode }
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
  const { serviceMessageTitle, serviceMessageContent, borderColourCode } = requestData
  const serviceMessageErrors = emptyFieldsValidator.validate([
    { fieldKey: 'serviceMessageTitle', fieldValue: serviceMessageTitle, errorMessage: serviceMessageErrorMessages.emptyServiceMessageTitle },
    { fieldKey: 'serviceMessageContent', fieldValue: serviceMessageContent, errorMessage: serviceMessageErrorMessages.emptyServiceMessageContent },
    { fieldKey: 'borderColourCode', fieldValue: borderColourCode, errorMessage: serviceMessageErrorMessages.emptyServiceMessgeBorderColour }
  ])
  if (serviceMessageErrors.hasError()) {
    return serviceMessageErrors
  }

  const serviceMessageData = administrationMessageService.prepareSubmissionData(requestData, userId)
  await administrationMessageDataService.sqlCreateOrUpdate(serviceMessageData)
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
  if (requestData.id !== undefined) {
    serviceMessageData.id = requestData.id
  }
  serviceMessageData.borderColourCode = requestData.borderColourCode
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
