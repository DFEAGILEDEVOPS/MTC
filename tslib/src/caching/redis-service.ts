import Redis, { type RedisOptions } from 'ioredis'
import config from '../config'
import * as Logger from '../common/logger'
import { type RedisCacheItem, RedisItemDataType } from './RedisCacheItemMetadata'
import { isNil } from 'ramda'
import { type ILogger } from '../common/logger'

export interface IRedisService {
  /**
   * @description retrieve an item from the cache, under the given key
   * @param {string} key the unique string key of the redis entry to fetch
   * @throws when the data type of the retrieved value is unsupported
   * @returns {Promise<unknown | undefined>} an awaitable promise containing the item if it exists, or undefined if it does not
   */
  get (key: string): Promise<unknown | undefined>
  /**
   * @description insert or ovewrite an item in the cache, which lives indefinitely
   * @param {string} key the unique string key of the redis entry to persist
   * @param {object | string} value the item to persist in redis cache
   * @throws when the incoming item datatype is not supported and when the setex redis operation fails
   * @returns {Promise<void} an awaitable promise
   */
  set (key: string, value: string | Record<string, any>): Promise<void>
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
  setex (key: string, value: string | any, ttl: number): Promise<void>
  /**
   * @description drop a series of items from the cache
   * @param {Array<string>} keys an array of keys to invalidate
   * @returns {Promise<Array<[error: Error | null, result: unknown]> | null | undefined>}
   */
  drop (keys: string[]): Promise<Array<[error: Error | null, result: unknown]> | null | undefined>
  /**
   * @description get the TTL of an existing item in the cache
   * @param key the key of the item in the cache
   * @returns the TTL in seconds or null if the item is not found
   */
  ttl (key: string): Promise<number | null>
  /**
   * @description set the TTL of an existing item in the cache
   * @param key the unique string key of the redis entry to update
   * @param ttl the expiry time, in seconds from now
   */
  expire (key: string, ttl: number): Promise<any>
  /**
   * Drop multiple keys that share a common prefix
   * @param prefix the start of the string that matches the keys to be dropped
   */
  dropByPrefix (prefix: string): Promise<void>
}

export class RedisService implements IRedisService {
  private readonly logger: Logger.ILogger

  constructor (logger?: ILogger) {
    this.logger = logger ?? new Logger.ConsoleLogger()
  }

  private async getRedis (): Promise<Redis> {
    return RedisSingleton.getRedisService()
  }

  async get (key: string): Promise<unknown | undefined> {
    try {
      const redis = await this.getRedis()
      const cacheEntry = await redis.get(key)
      if (isNil(cacheEntry)) return
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
      if (err instanceof Error) {
        this.logger.error(`REDIS (get): Error getting ${key}: ${err.message}`)
      }
      throw err
    }
  }

  prepareForStorage (value: string | Record<string, unknown> | number): any {
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
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      value: value.toString()
    }
    const storageItemString = JSON.stringify(storageItem)
    return storageItemString
  }

  async setex (key: string, value: string | number | Record<string, unknown>, ttl: number): Promise<void> {
    try {
      const storageItem = this.prepareForStorage(value)
      const redis = await this.getRedis()
      await redis.setex(key, ttl, storageItem)
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(`REDIS (setex): Error setting ${key}: ${err.message}`)
      }
      throw err
    }
  }

  async set (key: string, value: string | number | Record<string, unknown>): Promise<void> {
    try {
      const storageItem = this.prepareForStorage(value)
      const redis = await this.getRedis()
      await redis.set(key, storageItem)
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(`REDIS (set): Error setting ${key}: ${err.message}`)
      }
      throw err
    }
  }

  async drop (keys: string[]): Promise<Array<[error: Error | null, result: unknown]> | null | undefined> {
    if (keys.length === 0) {
      return
    }
    const redis = await this.getRedis()
    const pipeline = redis.pipeline()
    keys.forEach(c => {
      pipeline.del(c)
    })
    return pipeline.exec()
  }

  async ttl (key: string): Promise<number | null> {
    const redis = await this.getRedis()
    return redis.ttl(key)
  }

  async expire (key: string, ttl: number): Promise<any> {
    const redis = await this.getRedis()
    return redis.expire(key, ttl)
  }

  async dropByPrefix (prefix: string): Promise<void> {
    const now = Date.now() // ms
    const redis = await this.getRedis()
    const cmd = `for i, name in ipairs(redis.call('KEYS', '${prefix}*')) do redis.call('DEL', name); end`
    await redis.eval(cmd, 0)
    const then = Date.now() // ms
    this.logger.info(`RedisService:dropByPrefix took ${then - now} ms`)
  }
}

class RedisSingleton {
  private static redisService: Redis

  private constructor () { }

  private static readonly options: RedisOptions = {
    port: Number(config.Redis.Port),
    host: config.Redis.Host,
    password: config.Redis.Key,
    lazyConnect: true,
    tls: config.Redis.useTLS ? { host: config.Redis.Host } : undefined
  }

  public static async getRedisService (): Promise<Redis> {
    if (this.redisService !== undefined) {
      return this.redisService
    }
    this.redisService = new Redis(this.options)
    console.log(`RedisSingleton: attempting to connect to redis at ${this.options.host}:${this.options.port}`)
    await this.redisService.connect()
    return this.redisService
  }
}
