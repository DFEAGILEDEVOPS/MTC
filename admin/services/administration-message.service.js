'use strict'
import { ServiceMessageCodesService } from './service-message/service-message.service'
import { ServiceMessageValidator } from './service-message/service-message.validator'
const { marked } = require('marked')
const administrationMessageDataService = require('./data-access/administration-message.data.service')
const redisCacheService = require('./data-access/redis-cache.service')
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
  const areaCode = requestData.areaCode ? requestData.areaCode : []
  // validate incoming area codes - the single letter code must match what we have in the DB.
  const validAreaCodes = await ServiceMessageCodesService.getAreaCodes()
  console.log('valid area codes', validAreaCodes)
  const validBorderColourCodes = await ServiceMessageCodesService.getBorderColourCodes()
  console.log('valid border codfes', validBorderColourCodes)
  const validatorInput = {
    serviceMessageTitle: { fieldKey: 'serviceMessageTitle', fieldValue: serviceMessageTitle, errorMessage: serviceMessageErrorMessages.emptyServiceMessageTitle },
    serviceMessageContent: { fieldKey: 'serviceMessageContent', fieldValue: serviceMessageContent, errorMessage: serviceMessageErrorMessages.emptyServiceMessageContent },
    borderColourCode: { fieldKey: 'borderColourCode', fieldValue: borderColourCode, errorMessage: serviceMessageErrorMessages.emptyServiceMessgeBorderColour, allowedValues: validBorderColourCodes.map(c => c.code) },
    areaCode: { fieldKey: 'areaCode', fieldValue: areaCode, errorMessage: serviceMessageErrorMessages.invalidAreaCode, allowedValues: validAreaCodes.map(c => c.code) }
  }
  console.log('validator input 1 ', JSON.stringify(validatorInput, undefined, ' ', 4))
  if (areaCode.length === 0) {
    // The user has not chosen any area codes, which means the message applies to all of them
    validAreaCodes.forEach(c => { areaCode.push(c) }) // copy the codes over
  }
  console.log('validator input 2 ', JSON.stringify(validatorInput, undefined, ' ', 4))

  const serviceMessageErrors = ServiceMessageValidator.validate(validatorInput)
  if (serviceMessageErrors.hasError()) {
    console.log('errors', serviceMessageErrors)
    return serviceMessageErrors
  }

  const serviceMessageData = administrationMessageService.prepareSubmissionData(validatorInput, userId)
  await administrationMessageDataService.sqlCreateOrUpdate(serviceMessageData)
  return redisCacheService.set(serviceMessageRedisKey, serviceMessageData)
}

/**
 * Prepare the service message data for sql transmission
 * @param {object} data
 * @param {number} userId
 * @returns {Object}
 */
administrationMessageService.prepareSubmissionData = (data, userId) => {
  const serviceMessageData = {}
  serviceMessageData.createdByUser_id = userId
  serviceMessageData.title = data.serviceMessageTitle.fieldValue
  serviceMessageData.message = data.serviceMessageContent.fieldValue
  if (data.id !== undefined) {
    serviceMessageData.id = data.id
  }
  serviceMessageData.borderColourCode = data.borderColourCode.fieldValue
  serviceMessageData.areaCode = data.areaCode.fieldValue
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
