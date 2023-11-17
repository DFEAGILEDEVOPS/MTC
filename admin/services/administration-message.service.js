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

const accessArrangementsPathRe = /^\/access-arrangements\/.*/
const hdfPathRe = /^\/attendance\/.*/
const nonSittingCodesPathRe = /^\/pupils-not-taking-the-check\/.*/
const pinGenPathRe = /^\/pupil-pin\/.*/
const pupilGroupPathRe = /^\/group\/.*/
const pupilStatusPathRe = /^\/pupil-status$/
const restartPathRe = /^\/restart\//

/**
 * @typedef serviceMessage
 * @property message string
 * @property title string
 * @property borderColourCode string
 * @property [id] number optional
 * @property areaCodes string[]
 */

/**
 * Get the current service message
 * @returns {Promise<serviceMessage | undefined>}
 */
administrationMessageService.getMessage = async () => {
  let html
  let rawMessage // object[] with .message => markdown
  try {
    rawMessage = await administrationMessageService.fetchMessages()
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
 * Return the service messages filtered by path.
 * @param {string} path - from req.path
 * @returns {Promise<serviceMessage[]>}
 */
administrationMessageService.getFilteredMessagesForRequest = async function getFilteredMessagesForRequest (path) {
  try {
    const messages = await administrationMessageService.getMessages()
    const allAreaCodes = await ServiceMessageCodesService.getAreaCodes()
    const filteredMessages = []
    for (const msg of messages) {
      if (msg.areaCodes.length === allAreaCodes.length) {
        // This message applies to all sections. Let everyone see it.
        filteredMessages.push(msg)
      } else {
        // check each area against the current path to see if it should be shown.
        for (const areaCode of msg.areaCodes) {
          console.log(`Testing areacode ${areaCode} for msg ${msg.title}`)
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
          }
        }
      }
    }
    return filteredMessages
  } catch (error) {
    console.error('Error getting filtered messages', error)
    return []
  }
}

/**
 * Get the current service message
 * @returns {Promise<serviceMessage | undefined>}
 */
administrationMessageService.getMessages = async () => {
  let rawMessages = [] // object[] with .message => markdown
  try {
    rawMessages = await administrationMessageService.fetchMessages()
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
  console.log('getMessages returning: ', result)
  return result
}

/**
 * Fetch the service message from DB or cache with the message property as raw markdown, or plain text.
 * @returns {Promise<serviceMessage | undefined>}
 */
administrationMessageService.fetchMessages = async function fetchServiceMessage () {
  console.log('fetchMessages called()')
  // let cachedServiceMessages
  // const result = await redisCacheService.get(serviceMessageRedisKey)
  // try {
  //   cachedServiceMessages = JSON.parse(result)
  //   if (cachedServiceMessages) {
  //     return cachedServiceMessages
  //   }
  // } catch (ignore) {
  //   console.log('redis cache miss for service messages')
  // }
  return administrationMessageDataService.sqlFindServiceMessages()
}

administrationMessageService.fetchMessageBySlug = async function fetchMessageBySlug (slug) {
  console.log('fetchMessageBySlug called()')
  // let cachedServiceMessages
  // const result = await redisCacheService.get(serviceMessageRedisKey)
  // try {
  //   cachedServiceMessages = JSON.parse(result)
  //   if (cachedServiceMessages) {
  //     return cachedServiceMessages
  //   }
  // } catch (ignore) {
  //   console.log('redis cache miss for service messages')
  // }

  return administrationMessageDataService.sqlFindServiceMessageBySlug(slug)
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
  console.log('valid area codes', validAreaCodes)

  // Get lookup values for border codes - needed for validation
  const validBorderColourCodes = await ServiceMessageCodesService.getBorderColourCodes()
  console.log('valid border codes', validBorderColourCodes)

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
  console.log('validator input 1 ', JSON.stringify(validatorInput, undefined, ' ', 4))

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
administrationMessageService.dropMessage = async (userId, slug) => {
  if (!userId) {
    throw new Error('User id not found in session')
  }
  await administrationMessageDataService.sqlDeleteServiceMessage(slug)
  return redisCacheService.drop(serviceMessageRedisKey)
}

module.exports = administrationMessageService
