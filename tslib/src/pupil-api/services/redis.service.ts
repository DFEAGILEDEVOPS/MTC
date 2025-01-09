import { Redis } from 'ioredis'
import type { RedisOptions } from 'ioredis'
import config from '../config'
import { Logger } from './log.service'

export interface IRedisService {
  /**
   * @description retrieve an item from the cache, under the given key
   */
  get (key: string): Promise<any | null>
  /**
   * @description insert or ovewrite an item in the cache, which lives for a specific duration
   */
  setex (key: string, value: string | object, ttl: number): Promise<void>
  /**
   * @description drop a series of items from the cache
   */
  drop (keys: string[]): Promise<[error: Error | null, result: unknown][] | null>
  /**
   * @description cleans up the underlying redis client implementation
   */
  quit (): Promise<string>
  /**
   * @description set expiry on a redis item
   */
  expire (key: string, ttl: number): Promise<void>
  /**
   * @description get the TTL of an existing item in the cache
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
