'use strict'

const redisCacheService = require('../services/redis-cache.service')

const administrationMessageService = {}
const redisKey = 'serviceMessage'

/**
 * Get the service message
 * @returns {object}
 */
administrationMessageService.getMessage = async () => {
  const redisResult = await redisCacheService.get(redisKey)
  return JSON.parse(redisResult)
}

/**
 * Set the service message
 * @param {String} serviceMessageTitle
 * @param {String} serviceMessageContent
 * @returns {Promise<*>}
 */
administrationMessageService.setMessage = async (serviceMessageTitle, serviceMessageContent) => {
  const serviceMessage = {
    serviceMessageTitle,
    serviceMessageContent
  }
  return redisCacheService.set(redisKey, serviceMessage)
}

/**
 * Drops the service message
 * @returns {Promise<*>}
 */
administrationMessageService.dropMessage = async () => {
  return redisCacheService.drop(redisKey)
}

module.exports = administrationMessageService
