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

// Regular expressions for all the various top level paths in the app.
const accessArrangementsPathRe = /^\/access-arrangements\/.*/
const hdfPathRe = /^\/attendance\/.*/
const nonSittingCodesPathRe = /^\/pupils-not-taking-the-check\/.*/
const pinGenPathRe = /^\/pupil-pin\/.*/
const pupilGroupPathRe = /^\/group\/.*/
const pupilStatusPathRe = /^\/pupil-status$/
const restartPathRe = /^\/restart\//
const pupilRegisterPathRe = /^\/pupil-register\//

/**
 * Return the service messages filtered by path.
 * @param {string} path - from req.path
 * @returns {Promise<serviceMessage[] | []>}
 */
administrationMessageService.getFilteredMessagesForRequest = async function getFilteredMessagesForRequest (path) {
  try {
    /** @var ServiceMessagesAndAreaCodes */
    const messageData = await administrationMessageService.getMessagesAndAreaCodes()
    if (messageData === undefined) return []
    if (!('messages' in messageData) || !('areaCodes' in messageData)) return []
    const messages = messageData.messages
    const allAreaCodes = Array.isArray(messageData.areaCodes) ? messageData.areaCodes : []
    const filteredMessages = []
    for (const msg of messages) {
      if (msg.areaCodes.length === allAreaCodes.length) {
        // This message applies to all sections. Let everyone see it.
        filteredMessages.push(msg)
      } else {
        // check each area against the current path to see if it should be shown.
        for (const areaCode of msg.areaCodes) {
          switch (true) {
            case accessArrangementsPathRe.test(path):
              if (areaCode === 'A') filteredMessages.push(msg)
              break

            case hdfPathRe.test(path):
              if (areaCode === 'H') filteredMessages.push(msg)
              break

            case nonSittingCodesPathRe.test(path):
              if (areaCode === 'N') filteredMessages.push(msg)
              break

            case pinGenPathRe.test(path):
              if (areaCode === 'P') filteredMessages.push(msg)
              break

            case pupilGroupPathRe.test(path):
              if (areaCode === 'G') filteredMessages.push(msg)
              break

            case pupilStatusPathRe.test(path):
              if (areaCode === 'S') filteredMessages.push(msg)
              break

            case restartPathRe.test(path):
              if (areaCode === 'R') filteredMessages.push(msg)
              break

            case pupilRegisterPathRe.test(path):
              if (areaCode === 'T') filteredMessages.push(msg)
              break
          }
        }
      }
    }
    return filteredMessages
  } catch (error) {
    logger.error('Error getting filtered messages', error)
    return []
  }
}
/**
 * @typedef ServiceMessage
 * @property message string
 * @property title string
 * @property borderColourCode string
 * @property [id] number optional
 * @property areaCodes string[]
 */

/**
 * @typedef AreaCode
 * @property code string
 * @property description string
 */

/**
 * @typedef ServiceMessagesAndAreaCodes
 * @property messages ServiceMessage[]
 * @property areaCodes: AreaCode[]
 */

/**
 * Fetch the service messages from DB or cache with the message property as raw markdown, or plain text.
 * Also returns all the known AreaCodes to optimise the getFilteredMessages() call
 * @returns {Promise<ServiceMessagesAndAreaCodes | undefined>}
 */
administrationMessageService.getMessagesAndAreaCodes = async function getMessagesAndAreaCodes () {
  let data
  try {
    const result = await redisCacheService.get(serviceMessageRedisKey)
    // Object.hasOwn() available since node v16.9
    if (result !== undefined && typeof result === 'object' && ('messages' in result) &&
      Array.isArray(result.messages) && ('areaCodes' in result) && Array.isArray(result.areaCodes)) {
      return result
    }
    // Fetch service messages and all area codes from the DB
    const messages = await administrationMessageDataService.sqlFindServiceMessages()
    if (Array.isArray(messages) && messages.length > 0) {
      const htmlMessages = administrationMessageService.parseAndSanitise(messages)
      const allAreaCodes = await ServiceMessageCodesService.getAreaCodes()
      if (Array.isArray(allAreaCodes)) {
        data = {
          areaCodes: allAreaCodes,
          messages: htmlMessages
        }
        await redisCacheService.set(serviceMessageRedisKey, data)
      }
      return data
    }
  } catch (error) {
    console.error(error)
    logger.error('Error getting messages and areaCodes: ' + JSON.stringify(error))
  }
  // otherwise implicitly return undefined
}

administrationMessageService.getRawServiceMessages = async function getRawServiceMessages () {
  return administrationMessageDataService.sqlFindServiceMessages()
}

/**
 * Convert an array of markdown messages into sanitised HTML
 * @param {} rawMessage[]
 * @returns undefined | purifiedMessage[]
 */
administrationMessageService.parseAndSanitise = function parseAndSanitise (rawMessages) {
  try {
    if (rawMessages === undefined) {
      return undefined
    }
    rawMessages.forEach(msg => {
      msg.uncleanHtml = marked.parse(msg.message)
    })
  } catch (error) {
    logger.alert(`serviceMessage: failed to render.  Error: ${error.message}`)
    return undefined // show the page at least, without the service message
  }
  rawMessages.forEach(msg => {
    msg.cleanMessage = sanitiseService.sanitise(msg.uncleanHtml)
  })

  const result = rawMessages.map(o => {
    return {
      title: o.title,
      message: o.cleanMessage,
      borderColourCode: o.borderColourCode,
      areaCodes: o.areaCodes,
      urlSlug: o.urlSlug
    }
  })

  return result
}

administrationMessageService.getRawMessageBySlug = async function getRawMessageBySlug (slug) {
  try {
    const rawMessage = await administrationMessageDataService.sqlFindServiceMessageBySlug(slug)
    return rawMessage
  } catch (error) {
    logger.error('getRawMessageBySlug() Failed to get message: ' + JSON.stringify(error))
  }
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
  // validate incoming area codes - the single letter code must match what we have in the DB.
  const validAreaCodes = await ServiceMessageCodesService.getAreaCodes()

  // Get lookup values for border codes - needed for validation
  const validBorderColourCodes = await ServiceMessageCodesService.getBorderColourCodes()

  const { serviceMessageTitle, serviceMessageContent, borderColourCode } = requestData
  let areaCode = requestData.areaCode ? requestData.areaCode : []
  if (!Array.isArray(areaCode)) areaCode = [areaCode]
  if (areaCode.length === 0) {
    // The user has not chosen any area codes, which means the message applies to all of them
    validAreaCodes.forEach(c => { areaCode.push(c.code) }) // copy the codes over
  }

  const validatorInput = {
    serviceMessageTitle: { fieldKey: 'serviceMessageTitle', fieldValue: serviceMessageTitle, errorMessage: serviceMessageErrorMessages.emptyServiceMessageTitle },
    serviceMessageContent: { fieldKey: 'serviceMessageContent', fieldValue: serviceMessageContent, errorMessage: serviceMessageErrorMessages.emptyServiceMessageContent },
    borderColourCode: { fieldKey: 'borderColourCode', fieldValue: borderColourCode, errorMessage: serviceMessageErrorMessages.emptyServiceMessgeBorderColour, allowedValues: validBorderColourCodes.map(c => c.code) },
    areaCode: { fieldKey: 'areaCode', fieldValue: areaCode, errorMessage: serviceMessageErrorMessages.invalidAreaCode, allowedValues: validAreaCodes.map(c => c.code) }
  }

  const serviceMessageErrors = ServiceMessageValidator.validate(validatorInput)
  if (serviceMessageErrors.hasError()) {
    return serviceMessageErrors
  }

  if (requestData.urlSlug !== undefined) {
    validatorInput.urlSlug = requestData.urlSlug
  }

  const serviceMessageData = administrationMessageService.prepareSubmissionData(validatorInput, userId)
  await administrationMessageDataService.sqlCreateOrUpdate(serviceMessageData)

  // Just drop the cache as it is now invalidated.  The next page load will refresh the cache.
  return redisCacheService.drop(serviceMessageRedisKey)
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
  if (data.urlSlug !== undefined) {
    serviceMessageData.urlSlug = data.urlSlug
  }
  serviceMessageData.borderColourCode = data.borderColourCode.fieldValue
  serviceMessageData.areaCode = data.areaCode.fieldValue
  return serviceMessageData
}

/**
 * Drops the service message
 * @returns {Promise<*>}
 */
administrationMessageService.dropMessage = async (userId, slug) => {
  if (!userId) {
    throw new Error('User id not found in session')
  }
  await administrationMessageDataService.sqlDeleteServiceMessage(slug)

  // Just drop the cache as it is now invalidated.  The next page load will refresh the cache.
  await redisCacheService.drop(serviceMessageRedisKey)
}

module.exports = administrationMessageService
