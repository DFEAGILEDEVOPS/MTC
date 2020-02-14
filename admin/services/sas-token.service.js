'use strict'

const azure = require('azure-storage')
const moment = require('moment')
const logger = require('./log.service').getLogger()
const config = require('../config')
const redisKeyService = require('./redis-key.service')
const redisCacheService = require('./data-access/redis-cache.service')

const addPermissions = azure.QueueUtilities.SharedAccessPermissions.ADD
const oneHourInSeconds = 1 * 60 * 60
let azureQueueService

const sasTokenService = {
  /**
   *
   * @param queueName
   * @param {Moment} expiryDate
   * @param {Object} serviceImplementation
   * @return {{token: string, url: string, queueName: string}}
   */
  generateSasToken: async function (queueName, expiryDate, serviceImplementation) {
    // See if a valid token can be retrieved from redis
    const redisKeyName = redisKeyService.getSasTokenKey(queueName)
    try {
      const token = await redisCacheService.get(redisKeyName)
      if (token) {
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
    if (redisKeyName) {
      try {
        await redisCacheService.set(redisKeyName, tokenObject, oneHourInSeconds)
      } catch (error) {
        logger.error(`Failed to cache sasToken for ${queueName}`, error)
      }
    }

    return tokenObject
  }
}

module.exports = sasTokenService
