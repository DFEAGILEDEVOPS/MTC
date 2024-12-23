import { Redis } from 'ioredis'
import type { RedisOptions } from 'ioredis'
import config from '../config'
import { Logger } from './log.service'

export interface IRedisService {
  /**
   * @description retrieve an item from the cache, under the given key
   * @param {string} key the unique string key of the redis entry to fetch
   * @throws when the data type of the retrieved value is unsupported
   * @returns {Promise<string | null>} an awaitable promise containing the item if it exists, or undefined if it does not
   */
  get (key: string): Promise<any | null>
  /**
   * @description insert or ovewrite an item in the cache, which lives for a specific duration
   * @param {string} key the unique string key of the redis entry to persist
   * @param {object | string} value the item to persist in redis cache
   * @param {number} ttl how long to store the item in seconds
   * @throws when the incoming item datatype is not supported and when the setex redis operation fails
   * @returns {Promise<void>} an awaitable promise
   */
  setex (key: string, value: string | object, ttl: number): Promise<void>
  /**
   * @description drop a series of items from the cache
   * @param {Array<string>} keys an array of keys to invalidate
   * @returns {Promise<void>}
   */
  drop (keys: string[]): Promise<[error: Error | null, result: unknown][] | null>
  /**
   * @description cleans up the underlying redis client implementation
   * @returns void
   */
  quit (): Promise<string>
  /**
   * @description set expiry on a redis item
   * @param key key of the item to update TTL on
   * @param ttl the expiry time in seconds
   */
  expire (key: string, ttl: number): Promise<void>
  /**
   * @description get the TTL of an existing item in the cache
   * @param key the key of the item in the cache
   * @returns the TTL in seconds or null if the item is not found
   */
  ttl (key: string): Promise<number | null>
}

/**
 * enhanced redis service which stores items with type metadata.
 * Not used within Pupil API yet.
 */
export class RedisService implements IRedisService {
  private readonly redis: Redis
  private readonly logger: Logger

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
    this.redis.on('error', (error) => { this.logger.error(`ERROR: [pupil-api]: redis error: ${error.message}`, error) })
    this.logger = new Logger()
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
    } catch (err: any) {
      this.logger.error(`REDIS (get): Error getting ${key}: ${err.message}`)
      throw err
    }
  }

  async setex (key: string, value: string | number | object, ttl: number): Promise<void> {
    try {
      const dataType = typeof (value)
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
      await this.redis.setex(key, ttl, storageItemString)
    } catch (err: any) {
      this.logger.error(`REDIS (setex): Error setting ${key}: ${err.message}`)
      throw err
    }
  }

  async drop (keys: string[]): Promise<[error: Error | null, result: unknown][] | null> {
    if (keys.length === 0) {
      throw new Error('Invalid key list')
    }
    const pipeline = this.redis.pipeline()
    keys.forEach(c => {
      pipeline.del(c)
    })
    return pipeline.exec()
  }

  async quit (): Promise<string> {
    return this.redis.quit()
  }

  async ttl (key: string): Promise<number | null> {
    return this.redis.ttl(key)
  }

  async expire (key: string, ttl: number): Promise<any> {
    return this.redis.expire(key, ttl)
  }
}

export class RedisCacheItemMetadata {
  constructor (type: RedisItemDataType) {
    this.type = type
  }

  type: RedisItemDataType
}

export class RedisCacheItem {
  constructor (meta: RedisCacheItemMetadata, value: string) {
    this.meta = meta
    this.value = value
  }

  meta: RedisCacheItemMetadata
  value: string
}

export enum RedisItemDataType {
  string = 'string',
  number = 'number',
  object = 'object'
}
