const Redis = require('ioredis')
const config = require('../../config')
const logger = require('../log.service').getLogger()

const redisConfig = {
  port: config.Redis.Port,
  host: config.Redis.Host
}
if (config.Redis.Key) {
  redisConfig.password = config.Redis.Key
}
if (config.Redis.useTLS) {
  redisConfig.tls = { host: config.Redis.Host }
}

let redis

const redisConnect = () => {
  if (!redis) {
    redis = new Redis(redisConfig)
  }
}

const redisCacheService = {}

/**
 * Returns the data from a Redis key entry
 * @param key - the full Redis key to get
 * @returns {Promise<any>}
 */
redisCacheService.get = async key => {
  redisConnect()
  try {
    const cacheEntry = await redis.get(key)
    return unwrap(cacheEntry)
  } catch (err) {
    logger.error(`REDIS (get): Error getting ${key}: ${err.message}`)
    throw err
  }
}

/**
 * Stores data for a Redis key
 * @param key {string} - the redis key to set
 * @param value {any} - data to insert
 * @param ttl {number} - optional. time to expiry in seconds
 * @returns {Promise<void>}
 */
redisCacheService.set = async (key, value, ttl = undefined) => {
  redisConnect()
  try {
    const storageItemString = prepareCacheEntry(value)
    if (ttl) {
      await redis.setex(key, ttl, storageItemString)
    } else {
      await redis.set(key, storageItemString)
    }
  } catch (err) {
    logger.error(`REDIS (set): Error setting ${key}: ${err.message}`)
    throw err
  }
}

/**
 * Drops any supplied caches - so they can be re-queried
 * @param cacheKeys - A single string or array of strings
 * @returns {Promise<Boolean>}
 */
redisCacheService.drop = async (cacheKeys = []) => {
  if (Array.isArray(cacheKeys) && cacheKeys.length === 0) {
    return false
  }
  redisConnect()
  if (typeof cacheKeys === 'string') {
    cacheKeys = [cacheKeys]
  }
  const pipeline = redis.pipeline()
  cacheKeys.forEach(c => {
    pipeline.del(c)
  })
  await pipeline.exec()
  logger.info(`REDIS (drop): Dropped \`${cacheKeys.join('`, `')}\``)
  return true
}

/**
 * @description set many items in one atomic operation, with optional expiry
 * @param {[{key:string, value:object, ttl:number | undefined}]} items a dictionary of items to add to redis
 * @returns {Promise<void>}
 */
redisCacheService.setMany = async (items) => {
  if (!Array.isArray(items)) {
    throw new Error('items is not an array')
  }
  redisConnect()
  const multi = redis.multi()
  for (let index = 0; index < items.length; index++) {
    const item = items[index]
    const storageItem = prepareCacheEntry(item.value)
    if (item.ttl !== undefined) {
      logger.info(`REDIS (multi:setex): adding ${item.key} ttl:${item.ttl}`)
      multi.setex(item.key, item.ttl, storageItem)
    } else {
      multi.set(item.key, storageItem)
    }
  }
  logger.info('REDIS (multi:exec)')
  return multi.exec()
}

/**
 * Fetch many redis keys by their keys in one network trip
 * @param keys
 * @return {Promise<*>}
 */
redisCacheService.getMany = async (keys) => {
  if (!Array.isArray(keys)) {
    throw new Error('keys is not an array')
  }
  redisConnect()
  const rawData = await redis.mget(...keys)
  const data = rawData.map(raw => unwrap(raw))
  logger.info(`(redis) getMany ${keys.join(', ')}`)
  return data
}

/**
 * Wrap a value for storing in redis with type information
 * @param value
 * @return {string}
 */
function prepareCacheEntry (value) {
  const dataType = typeof value
  let cacheItemDataType
  switch (dataType) {
    case 'string':
      cacheItemDataType = 'string'
      break
    case 'number':
      cacheItemDataType = 'number'
      break
    case 'object':
      cacheItemDataType = 'object'
      value = JSON.stringify(value)
      break
    default:
      throw new Error(`unsupported data type ${dataType}`)
  }
  const storageItem = {
    meta: {
      type: cacheItemDataType
    },
    value: value.toString()
  }
  return JSON.stringify(storageItem)
}

/**
 * Unwrap a cached entry, returning the original type
 * @param cacheEntry
 * @return {number|any|undefined}
 */
function unwrap (cacheEntry) {
  if (cacheEntry === null) return undefined
  const cacheItem = JSON.parse(cacheEntry)
  switch (cacheItem.meta.type) {
    case 'string':
      return cacheItem.value
    case 'number':
      return Number(cacheItem.value)
    case 'object':
      try {
        const hydratedObject = JSON.parse(cacheItem.value)
        return hydratedObject
      } catch (e) {
        logger.error(`failed to parse redis cache item: ${cacheItem.value}.`)
        throw e
      }
    default:
      throw new Error(`unsupported cache item type:${cacheItem.meta.type}`)
  }
}

module.exports = redisCacheService
