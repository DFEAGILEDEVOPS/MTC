'use strict'

const azure = require('azure-storage')
const moment = require('moment')
const { performance } = require('perf_hooks')

const logger = require('./log.service').getLogger()
const config = require('../config')
const redisKeyService = require('./redis-key.service')
const redisCacheService = require('./data-access/redis-cache.service')
const queueNameService = require('./queue-name-service')

const addPermissions = azure.QueueUtilities.SharedAccessPermissions.ADD
const oneHourInSeconds = 1 * 60 * 60
let azureQueueService

/**
 * Sas Token Object
 * @typedef {Object} SasToken
 * @property {string} queueName - the queue it is valid for
 * @property {string} token - the token data
 * @property {string} url - the token as a url
 */

const sasTokenService = {
  /**
   *
   * @param {string} queueName
   * @param {moment.Moment} expiryDate
   * @param {Object} serviceImplementation
   * @return {Promise<SasToken>}
   */
  generateSasToken: async function (queueName, expiryDate, serviceImplementation = undefined) {
    const start = performance.now()
    // See if a valid token can be retrieved from redis
    const redisKeyName = redisKeyService.getSasTokenKey(queueName)
    try {
      const token = await redisCacheService.get(redisKeyName)
      if (token) {
        const end = performance.now()
        logger.debug(`generateSasToken(): took ${end - start} ms`)
        return token
      }
    } catch (error) {
      logger.error(`Error retrieving cached cached sasToken for ${queueName}`)
    }

    // Token not found in cache, so create a new one
    if (!serviceImplementation) {
      if (!azureQueueService) {
        if (!config.AZURE_STORAGE_CONNECTION_STRING) {
          throw new Error('An AZURE_STORAGE_CONNECTION_STRING is a required environment variable.')
        }
        // init the queue service the first time this is called
        azureQueueService = azure.createQueueService(config.AZURE_STORAGE_CONNECTION_STRING)
      }
      serviceImplementation = azureQueueService
    }

    if (!moment.isMoment(expiryDate) || !expiryDate.isValid()) {
      throw new Error('Invalid expiryDate')
    }

    // Create a SAS token
    // Set start time to five minutes ago to avoid clock skew.
    const startDate = new Date()
    startDate.setMinutes(startDate.getMinutes() - 5)

    const sharedAccessPolicy = {
      AccessPolicy: {
        Permissions: addPermissions,
        Start: startDate,
        Expiry: expiryDate.toDate()
      }
    }

    logger.debug('Generating SAS token for Queue: ' + queueName)

    const sasToken = serviceImplementation.generateSharedAccessSignature(queueName, sharedAccessPolicy)

    const tokenObject = {
      token: sasToken,
      url: serviceImplementation.getUrl(queueName),
      queueName: queueName
    }

    // Store the sasToken in redis
    try {
      await redisCacheService.set(redisKeyName, tokenObject, oneHourInSeconds)
    } catch (error) {
      logger.error(`Failed to cache sasToken for ${queueName}`, error)
    }
    const end = performance.now()
    logger.debug(`generateSasToken(): took ${end - start} ms`)
    return tokenObject
  },

  getTokens: async function (hasLiveChecks, expiryDate) {
    const start = performance.now()
    const queueNames = [
      queueNameService.NAMES.CHECK_STARTED,
      queueNameService.NAMES.PUPIL_PREFS,
      queueNameService.NAMES.PUPIL_FEEDBACK
    ]
    if (hasLiveChecks) {
      queueNames.push(queueNameService.NAMES.CHECK_SUBMIT)
    }

    // Attempt to retrieve all tokens from redis
    const redisKeys = queueNames.map(redisKeyService.getSasTokenKey)
    const cached = await redisCacheService.getMany(redisKeys)
    const result = {}
    cached.map(o => {
      if (o && o.queueName) {
        result[o.queueName] = o
      }
    })

    // validate we have all the required sasTokens, and create new ones if missing
    for (const name of queueNames) {
      if (!result[name]) {
        logger.debug(`getTokens(): cache miss ${name}`)
        result[name] = await this.generateSasToken(name, expiryDate)
      }
    }
    const end = performance.now()
    logger.debug(`getTokens() took ${end - start} ms`)
    return result
  }
}

module.exports = sasTokenService
