const Redis = require('ioredis')
const config = require('../config')
const base = require('./logger')

let redisConfig = {
  port: config.Redis.Port,
  host: config.Redis.Host
}
if (config.Redis.Key) {
  redisConfig.password = config.Redis.Key
}
if (config.Redis.useTLS) {
  redisConfig.tls = { host: config.Redis.Host }
}

let redis = false

const redisConnect = () => {
  if (!redis) {
    redis = new Redis(redisConfig)
  }
}

const redisCacheService = {}

/**
 * Returns the data from a Redis key entry
 * @param redisKey - the full Redis key to get
 * @returns {String}
 */
redisCacheService.get = async redisKey => {
  redisConnect()
  try {
    const result = await redis.get(redisKey)
    if (!result) {
      this.logger.info(`REDIS (get): \`${redisKey}\` is not set`)
      return false
    }
    this.logger.info(`REDIS (get): Retrieved \`${redisKey}\``)
    return result
  } catch (err) {
    this.logger.error(`REDIS (get): Error getting \`redisKey\`: ${err.message}`)
    throw err
  }
}

/**
 * Stores data for a Redis key
 * @param redisKey - the full Redis key to set
 * @param data - string data to insert
 * @param options - object that contains set options
 * @returns {Boolean}
 */
redisCacheService.set = async (redisKey, data, options) => {
  redisConnect()
  try {
    if (typeof data === 'object') {
      data = JSON.stringify(data)
    }
    if (options && options.expires) {
      await redis.set(redisKey, data, 'ex', options.expires)
    } else {
      await redis.set(redisKey, data)
    }

    this.logger.info(`REDIS (set): Stored \`${redisKey}\``)
    return true
  } catch (err) {
    this.logger.error(`REDIS (set): Error setting \`redisKey\`: ${err.message}`)
    throw err
  }
}

/**
 * Drops any supplied caches - so they can be re-queried
 * @param caches - A single string or array of strings
 * @returns {Boolean}
 */
redisCacheService.drop = async (caches = []) => {
  if (Array.isArray(caches) && caches.length === 0) {
    return false
  }
  redisConnect()
  if (typeof caches === 'string') {
    caches = [caches]
  }
  const pipeline = redis.pipeline()
  caches.forEach(c => {
    pipeline.del(c)
  })
  await pipeline.exec()
  this.logger.info(`REDIS (drop): Dropped \`${caches.join('`, `')}\``)
  return true
}

module.exports = Object.assign(redisCacheService, base)
