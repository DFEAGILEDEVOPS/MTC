const Redis = require('ioredis')
const config = require('../config')
const azureQueueService = require('./azure-queue.service')
const queueNameService = require('./queue-name-service')
const logger = require('./log.service').getLogger()

const { REDIS_CACHE_UPDATING, REDIS_CACHING } = config

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

const redis = new Redis(redisConfig)

const redisCacheService = {}

/**
 * Returns the data from a Redis key entry
 * @param redisKey - the full Redis key to get
 * @returns {String}
 */
redisCacheService.get = async redisKey => {
  if (!REDIS_CACHING) {
    return false
  }
  try {
    const result = await redis.get(redisKey)
    if (!result) {
      logger.info(`REDIS (get): \`${redisKey}\` is not set`)
      return false
    }
    logger.info(`REDIS (get): Retrieved \`${redisKey}\``)
    return result
  } catch (err) {
    logger.error(`REDIS (get): Error getting \`redisKey\`: ${err.message}`)
    throw err
  }
}

/**
 * Stores data for a Redis key
 * @param redisKey - the full Redis key to set
 * @param data - string data to insert
 * @returns {Boolean}
 */
redisCacheService.set = async (redisKey, data) => {
  if (!REDIS_CACHING) {
    return false
  }
  try {
    if (typeof data === 'object') {
      data = JSON.stringify(data)
    }
    await redis.set(redisKey, data)
    logger.info(`REDIS (set): Stored \`${redisKey}\``)
    return true
  } catch (err) {
    logger.error(`REDIS (set): Error setting \`redisKey\`: ${err.message}`)
    throw err
  }
}

/**
 * Drops any supplied caches - so they can be re-queried
 * @param caches - A single string or array of strings
 * @returns {Boolean}
 */
redisCacheService.drop = async (caches = []) => {
  if (!REDIS_CACHING || (Array.isArray(caches) && caches.length === 0)) {
    return false
  }
  if (typeof caches === 'string') {
    caches = [caches]
  }
  const pipeline = redis.pipeline()
  caches.forEach(c => {
    pipeline.del(c)
  })
  await pipeline.exec()
  logger.info(`REDIS (drop): Dropped \`${caches.join('`, `')}\``)
  return true
}

/**
 * Manually updates data in Redis and then sends to the Azure `sql-update` queue,
 * which will be performed in SQL Server by `/functions`
 * @param serviceKey - the redis cache key in the format `serviceName.methodName`
 * @param changes - object with changes in the format { tableName: 'foo-bar', update: { 1: { foo: 'bar' } } }
 * @returns {Boolean}
 */
redisCacheService.update = async (serviceKey, changes) => {
  if (!REDIS_CACHING || !REDIS_CACHE_UPDATING) {
    return false
  }
  let result
  try {
    result = await redis.get(serviceKey)
  } catch (err) {
    throw err
  }
  result = JSON.parse(result)
  result.recordset = result.recordset.map(r => {
    if (changes.update && changes.update[r.id]) {
      for (let prop in changes.update[r.id]) {
        r[prop] = changes.update[r.id][prop]
      }
    }
    if (changes.delete && changes.delete.indexOf(r.id.toString()) > -1) {
      return false
    }
    return r
  }).filter(r => r !== false)
  try {
    await redis.set(serviceKey, JSON.stringify(result))
    logger.info(`REDIS (update): Updated \`${serviceKey}\``)
    const sqlUpdateQueueName = queueNameService.getName(queueNameService.NAMES.SQL_UPDATE)
    await azureQueueService.addMessageAsync(sqlUpdateQueueName, { version: 2, messages: [changes] })
    logger.info(`REDIS (update): Sent \`${serviceKey}\` update to \`sql-update\` message queue`)
    return true
  } catch (err) {
    throw err
  }
}

module.exports = redisCacheService
