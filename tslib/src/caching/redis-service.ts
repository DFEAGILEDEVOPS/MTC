import Redis, { RedisOptions } from 'ioredis'
import config from '../config'
import * as Logger from '../common/logger'
import { RedisCacheItem, RedisItemDataType } from './RedisCacheItemMetadata'

export interface IRedisService {
  /**
   * @description retrieve an item from the cache, under the given key
   * @param {string} key the unique string key of the redis entry to fetch
   * @throws when the data type of the retrieved value is unsupported
   * @returns {Promise<string | null>} an awaitable promise containing the item if it exists, or undefined if it does not
   */
  get (key: string): Promise<any | null>
  /**
   * @description insert or ovewrite an item in the cache, which lives indefinitely
   * @param {string} key the unique string key of the redis entry to persist
   * @param {object | string} value the item to persist in redis cache
   * @throws when the incoming item datatype is not supported and when the setex redis operation fails
   * @returns {Promise<void} an awaitable promise
   */
  set (key: string, value: string | object): Promise<void>
  /**
   * @description drop a series of items from the cache
   * @param {Array<string>} keys an array of keys to invalidate
   * @returns {Promise<void>}
   */
  /**
   * @description insert or ovewrite an item in the cache, which lives for a specific duration
   * @param {string} key the unique string key of the redis entry to persist
   * @param {object | string} value the item to persist in redis cache
   * @param {number} ttl how long to store the item in seconds
   * @throws when the incoming item datatype is not supported and when the setex redis operation fails
   * @returns {Promise<void} an awaitable promise
   */
  setex (key: string, value: string | object, ttl: number): Promise<void>
  /**
   * @description drop a series of items from the cache
   * @param {Array<string>} keys an array of keys to invalidate
   * @returns {Promise<void>}
   */
  drop (keys: Array<string>): Promise<void>
  /**
   * @description cleans up the underlying redis client implementation
   * @returns void
   */
  quit (): Promise<string>
  /**
   * @description get the TTL of an existing item in the cache
   * @param key the key of the item in the cache
   * @returns the TTL in seconds or null if the item is not found
   */
  ttl (key: string): Promise<number | null>
}

export class RedisService implements IRedisService {

  private redis: Redis.Redis
  private logger: Logger.ILogger

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
    this.redis = new Redis(options)
    this.logger = new Logger.ConsoleLogger()
  }

  async get (key: string): Promise<any | null> {
    try {
      const cacheEntry = await this.redis.get(key)
      if (cacheEntry === null) return undefined
      const cacheItem: RedisCacheItem = JSON.parse(cacheEntry)
      switch (cacheItem.meta.type) {
        case RedisItemDataType.string:
          return cacheItem.value
        case RedisItemDataType.number:
          return Number(cacheItem.value)
        case RedisItemDataType.object:
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
    } catch (err) {
      this.logger.error(`REDIS (get): Error getting ${key}: ${err.message}`)
      throw err
    }
  }

  prepareForStorage (value: string | object | number): any {
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
      meta: {
        type: cacheItemDataType
      },
      value: value.toString()
    }
    const storageItemString = JSON.stringify(storageItem)
    return storageItemString
  }

  async setex (key: string, value: string | number | object, ttl: number): Promise<void> {
    try {
      const storageItem = this.prepareForStorage(value)
      await this.redis.setex(key, ttl, storageItem)
    } catch (err) {
      this.logger.error(`REDIS (setex): Error setting ${key}: ${err.message}`)
      throw err
    }
  }

  async set (key: string, value: string | number | object): Promise<void> {
    try {
      const storageItem = this.prepareForStorage(value)
      await this.redis.set(key, storageItem)
    } catch (err) {
      this.logger.error(`REDIS (set): Error setting ${key}: ${err.message}`)
      throw err
    }
  }

  async drop (keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return
    }
    const pipeline = this.redis.pipeline()
    keys.forEach(c => {
      pipeline.del(c)
    })
    return pipeline.exec()
  }

  quit (): Promise<string> {
    return this.redis.quit()
  }

  ttl (key: string): Promise<number | null> {
    return this.redis.ttl(key)
  }
}
