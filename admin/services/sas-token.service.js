'use strict'

const moment = require('moment')
const dataService = require('./data-access/queue-sas-token.data.service')

const logger = require('./log.service').getLogger()
const redisKeyService = require('./redis-key.service')
const redisCacheService = require('./data-access/redis-cache.service')
const queueNameService = require('./storage-queue-name-service')

const oneHourInSeconds = 1 * 60 * 60

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
   * @return {Promise<SasToken>}
   */
  generateSasToken: async function (queueName, expiryDate) {
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

    // Token not found in cache, so create a new one...

    if (!moment.isMoment(expiryDate) || !expiryDate.isValid()) {
      throw new Error('Invalid expiryDate')
    }

    // Create a SAS token
    // Set start time to five minutes ago to avoid clock skew.
    const startDate = moment()
    startDate.subtract(5, 'minutes')

    const sasToken = dataService.generateSasTokenWithPublishOnly(queueName, startDate.toDate(), expiryDate.toDate())

    const parts = sasToken.split('?')
    const tokenObject = {
      token: parts[1],
      url: parts[0],
      queueName
    }

    // Store the sasToken in redis
    try {
      await redisCacheService.set(redisKeyName, tokenObject, oneHourInSeconds)
    } catch (error) {
      logger.error(`Failed to cache sasToken for ${queueName}`, error)
    }
    return tokenObject
  },

  getTokens: async function (hasLiveChecks, expiryDate) {
    const queueNames = [
      queueNameService.NAMES.CHECK_STARTED,
      queueNameService.NAMES.PUPIL_PREFS,
      queueNameService.NAMES.PUPIL_FEEDBACK
    ]

    // Attempt to retrieve all tokens from redis
    const redisKeys = queueNames.map(redisKeyService.getSasTokenKey)
    const cached = await redisCacheService.getMany(redisKeys)
    const result = {}
    if (Array.isArray(cached)) {
      cached.forEach(o => {
        if (o && o.queueName) {
          result[o.queueName] = o
        }
      })
    }

    // validate we have all the required sasTokens, and create new ones if missing
    for (const name of queueNames) {
      if (!result[name]) {
        logger.debug(`getTokens(): cache miss ${name}`)
        result[name] = await this.generateSasToken(name, expiryDate)
      }
    }
    return result
  }
}

module.exports = sasTokenService
