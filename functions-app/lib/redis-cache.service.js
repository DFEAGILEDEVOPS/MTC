const Redis = require('ioredis')
const config = require('../config')
const base = require('./logger')

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
redisCacheService.get = async function redisGet (key) {
  redisConnect()
  try {
    this.logger.verbose(`REDIS (get): retrieving ${key}`)
    const cacheEntry = await redis.get(key)
    return unwrap(cacheEntry)
  } catch (err) {
    this.logger.error(`REDIS (get): Error getting ${key}: ${err.message}`)
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
redisCacheService.set = async function redisSet (key, value, ttl = undefined) {
  redisConnect()
  try {
    this.logger.verbose(`REDIS (set): adding ${key} ttl:${ttl}`)
    const storageItemString = prepareCacheEntry(value)
    if (ttl) {
      await redis.setex(key, ttl, storageItemString)
    } else {
      await redis.set(key, storageItemString)
    }
  } catch (err) {
    this.logger.error(`REDIS (set): Error setting ${key}: ${err.message}`)
    throw err
  }
}

/**
 * Drops any supplied caches - so they can be re-queried
 * @param {string|string[]} cacheKeys - A single string or array of strings
 * @returns {Promise<Boolean>}
 */
redisCacheService.drop = async function redisDrop (cacheKeys = []) {
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
  this.logger.verbose(`REDIS (drop): Dropped \`${cacheKeys.join('`, `')}\``)
  return true
}

/**
 * @description set many items in one atomic operation, with optional expiry
 * @param {[{key:string, value:object, ttl:number | undefined}]} items a dictionary of items to add to redis
 * @returns {Promise<void>}
 */
redisCacheService.setMany = async function setMany (items) {
  if (!Array.isArray(items)) {
    throw new Error('items is not an array')
  }
  redisConnect()
  const multi = redis.multi()
  for (let index = 0; index < items.length; index++) {
    const item = items[index]
    const storageItem = prepareCacheEntry(item.value)
    if (item.ttl !== undefined) {
      this.logger.verbose(`REDIS (multi:setex): adding ${item.key} ttl:${item.ttl}`)
      multi.setex(item.key, item.ttl, storageItem)
    } else {
      multi.set(item.key, storageItem)
    }
  }
  this.logger.verbose('REDIS (multi:exec)')
  return multi.exec()
}

/**
 * Fetch many redis keys by their keys in one network trip
 * @param keys
 * @return {Promise<*>}
 */
redisCacheService.getMany = async function getMany (keys) {
  if (!Array.isArray(keys)) {
    throw new Error('keys is not an array')
  }
  redisConnect()
  const rawData = await redis.mget(...keys)
  const data = rawData.map(raw => unwrap(raw))
  this.logger.verbose(`(redis) getMany ${keys.join(', ')}`)
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
        this.logger.error(`failed to parse redis cache item: ${cacheItem.value}.`)
        throw e
      }
    default:
      throw new Error(`unsupported cache item type:${cacheItem.meta.type}`)
  }
}

module.exports = Object.assign(redisCacheService, base)
