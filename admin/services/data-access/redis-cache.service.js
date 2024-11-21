const Redis = require('ioredis')
const config = require('../../config')
const logger = require('../log.service').getLogger()
const moment = require('moment')
const simpleIso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/

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

const redisConnect = async () => {
  try {
    if (!redis) {
      redis = new Redis(redisConfig)
      const info = await redis.info()
    }
  } catch (error) {
    logger.alert('ALERT: REDIS CONNECTION ERROR', error)
  }
}

const redisCacheService = {}

/**
 * Returns the data from a Redis key entry
 * @param key - the full Redis key to get
 * @returns {Promise<any>}
 */
redisCacheService.get = async key => {
  await redisConnect()
  try {
    logger.debug(`REDIS (get): retrieving ${key}`)
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
  await redisConnect()
  try {
    logger.debug(`REDIS (set): adding ${key} ttl:${ttl}`)
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
 * @param {string|string[]} cacheKeys - A single string or array of strings
 * @returns {Promise<Boolean>}
 */
redisCacheService.drop = async (cacheKeys = []) => {
  if (Array.isArray(cacheKeys) && cacheKeys.length === 0) {
    return false
  }
  await redisConnect()
  if (typeof cacheKeys === 'string') {
    cacheKeys = [cacheKeys]
  }
  const pipeline = redis.pipeline()
  cacheKeys.forEach(c => {
    pipeline.del(c)
  })
  await pipeline.exec()
  logger.debug(`REDIS (drop): Dropped \`${cacheKeys.join('`, `')}\``)
  return true
}

/**
 * @typedef {object} RedisItem
 * @property {string} key
 * @property {any} value
 * @property {number | undefined} ttl
 */

/**
 * @description set many items in one atomic operation, with optional expiry
 * @param {Array<RedisItem>} items a dictionary of items to add to redis
 * @returns {Promise<void>}
 */
redisCacheService.setMany = async (items) => {
  if (!Array.isArray(items)) {
    throw new Error('items is not an array')
  }
  await redisConnect()
  const multi = redis.multi()
  for (let index = 0; index < items.length; index++) {
    const item = items[index]
    const storageItem = prepareCacheEntry(item.value)
    if (item.ttl !== undefined) {
      logger.debug(`REDIS (multi:setex): adding ${item.key} ttl:${item.ttl}`)
      multi.setex(item.key, item.ttl, storageItem)
    } else {
      multi.set(item.key, storageItem)
    }
  }
  logger.debug('REDIS (multi:exec)')
  return multi.exec()
}

/**
 * Return the raw Redis client
 * @return {*}
 */
redisCacheService.getRedisClient = () => {
  redisConnect()
  return redis
}

/**
 * Fetch many redis keys by their keys in one network trip
 * @param keys
 * @return {Promise<Array<*>>}
 */
redisCacheService.getMany = async (keys) => {
  if (!Array.isArray(keys)) {
    throw new Error('keys is not an array')
  }
  await redisConnect()
  const rawData = await redis.mget(...keys)
  const data = rawData.map(raw => unwrap(raw))
  logger.debug(`(redis) getMany ${keys.join(', ')}`)
  return data
}

/**
 * Get the TTL of an object in seconds
 * The command returns -2 if the key does not exist.
 * The command returns -1 if the key exists but has no associated expire.
 * https://redis.io/commands/ttl
 */
redisCacheService.getTtl = async (key) => {
  if (typeof key !== 'string') {
    throw new Error('Invalid key')
  }
  if (key.length === 0) {
    throw new Error('Invalid key length')
  }
  await redisConnect()
  return await redis.ttl(key)
}

/**
 * DropByPrefix: drops keys by prefix
 * Warning: not recommended for production as it uses KEYS
 * @param prefix
 * @return {Promise<void>}
 */
redisCacheService.dropByPrefix = async (prefix) => {
  await redisConnect()
  const cmd = `for i, name in ipairs(redis.call('KEYS', '${prefix}*')) do redis.call('DEL', name); end`
  await redis.eval(cmd, 0)
}

redisCacheService.disconnect = async () => {
  if (redis) {
    return redis.quit()
  }
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

function reviver (key, value) {
  if (value && typeof value === 'string') {
    if (simpleIso8601Regex.test(value)) {
      try {
        const d = moment(value)
        if (d && d.isValid()) {
          return d
        }
      } catch (ignored) {}
    }
  }
  return value
}

/**
 * Unwrap a cached entry, returning the original type
 * @param cacheEntry
 * @return {number|any|undefined}
 */
function unwrap (cacheEntry) {
  if (cacheEntry === null) return undefined
  const cacheItem = JSON.parse(cacheEntry, reviver)
  switch (cacheItem.meta.type) {
    case 'string':
      return cacheItem.value
    case 'number':
      return Number(cacheItem.value)
    case 'object':
      try {
        const hydratedObject = JSON.parse(cacheItem.value, reviver)
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
