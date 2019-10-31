import Redis, { RedisOptions, Pipeline } from 'ioredis'
import config from '../config'
import * as Logger from '../common/logger'

export interface IRedisService {
  /**
   * @description retrieve an item from the cache, under the given key
   * @param {string} key the unique string key of the redis entry to fetch
   * @returns {Promise<string | null>} an awaitable promise containing the item if it exists, or undefined if it does not
   */
  get (key: string): Promise<any | null>
  /**
   * @description insert or ovewrite an item in the cache, which lives for a specific duration
   * @param {string} key the unique string key of the redis entry to persist
   * @param {object | string} value the item to persist in redis cache
   * @param {number} ttl how long to store the item in seconds
   * @returns {Promise<void} an awaitable promise
   */
  setex (key: string, value: string | object, ttl: number): Promise<void>
  /**
   * @description drop a series of items from the cache
   * @param {Array<string>} keys an array of keys to invalidate
   * @returns {Promise<void>}
   */
  drop (keys: Array<string>): Promise<void>
}

/**
 * exists purely to support mocking of ioredis Redis.Redis interface for unit tests
 * Redis.Redis has 194 members, so this avoids having to declare them all on a mock
 */
export interface IRedisDataService {
  get (key: string): Promise<any | null>
  setex (key: string, seconds: number, value: any): Promise<any>
  pipeline (commands?: string[][]): Pipeline
}

// type RedisCacheItemType = Record<'string' | 'object' | 'number', string>

export class RedisCacheItemMetadata {
  constructor (type: RedisItemDataType) {
    this.type = type
  }
  type: RedisItemDataType
}

export class RedisCacheItem {
  constructor (meta: RedisCacheItemMetadata, value: string) {
    this._meta = meta
    this.value = value
  }
  _meta: RedisCacheItemMetadata
  value: string
}

export enum RedisItemDataType {
  string = 'string',
  number = 'number',
  object = 'object'
}

export class RedisService implements IRedisService {

  private _redis: Redis.Redis
  private _logger: Logger.ILogger

  constructor () {
    const options: RedisOptions = {
      port: Number(config.Redis.Port),
      host: config.Redis.Host,
      password: config.Redis.Key
    }
    if (config.Redis.useTLS) {
      options.tls = {
        host: config.Redis.Host
      }
    }
    this._redis = new Redis(options)
    this._logger = new Logger.ConsoleLogger()
  }

  async get (key: string): Promise<any | null> {
    try {
      const cacheEntry = await this._redis.get(key)
      if (cacheEntry === null) return Promise.resolve(null)
      const cacheItem: RedisCacheItem = JSON.parse(cacheEntry)
      switch (cacheItem._meta.type) {
        case RedisItemDataType.string:
          return cacheItem.value
        case RedisItemDataType.number:
          return Number(cacheItem.value)
        case RedisItemDataType.object:
          const hydratedObject = JSON.parse(cacheItem.value)
          return hydratedObject
        default:
          throw new Error(`unsupported cache item type:${cacheItem._meta.type}`)
      }
    } catch (err) {
      this._logger.error(`REDIS (get): Error getting ${key}: ${err.message}`)
      throw err
    }
  }

  /**
   * @param key
   * @param value
   * @param ttl
   */
  async setex (key: string, value: string | number | object, ttl: number): Promise<void> {
    try {
      let dataType = typeof(value)
      let cacheItemDataType: RedisItemDataType
      switch (dataType) {
        case 'string':
          cacheItemDataType = RedisItemDataType.string
          break
        case 'number':
          cacheItemDataType = RedisItemDataType.number
          break
        case 'object':
          cacheItemDataType = RedisItemDataType.object
          value = JSON.stringify(value)
          break
        default:
          throw new Error(`unsupported data type ${dataType}`)
      }
      const storageItem: RedisCacheItem = {
        _meta: {
          type: cacheItemDataType
        },
        value: value.toString()
      }
      const storageItemString = JSON.stringify(storageItem)
      await this._redis.setex(key, ttl, storageItemString)
    } catch (err) {
      this._logger.error(`REDIS (setex): Error setting ${key}: ${err.message}`)
      throw err
    }
  }

  async drop (keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return
    }
    const pipeline = this._redis.pipeline()
    keys.forEach(c => {
      pipeline.del(c)
    })
    return pipeline.exec()
  }
}
