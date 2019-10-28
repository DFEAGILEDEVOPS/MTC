import Redis, { RedisOptions } from 'ioredis'
import config from '../config'
import * as Logger from '../common/logger'

export interface IRedisService {
  /**
   * @description retrieve an item from the cache, under the given key
   * @param {string} key the unique string key of the redis entry to fetch
   * @returns {Promise<string | null>} an awaitable promise containing the item if it exists, or undefined if it does not
   */
  get (key: string): Promise<string | null>
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

export class RedisService implements IRedisService {

  private _redis: Redis.Redis
  private _logger: Logger.ILogger

  constructor (logger?: Logger.ILogger, ioRedis?: Redis.Redis) {

    if (logger === undefined) {
      logger = new Logger.ConsoleLogger()
    }
    this._logger = logger

    if (ioRedis === undefined) {
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
    } else {
      this._redis = ioRedis
    }
  }

  async get (key: string): Promise<string | null> {
    try {
      const result = await this._redis.get(key)
      return result
    } catch (err) {
      this._logger.error(`REDIS (get): Error getting ${key}: ${err.message}`)
      throw err
    }
  }

  // always store as object with associated type metadata
  /**
   * `{
   *   _meta: {
   *      type: object | string | number| array,
   *      ttl: number
   *    },
   *   value:
   *  }
   * @param key
   * @param value
   * @param ttl
   */
  async setex (key: string, value: string | object, ttl: number): Promise<void> {
    try {
      if (typeof value === 'object') {
        value = JSON.stringify(value)
      }
      await this._redis.setex(key, ttl, value)
    } catch (err) {
      this._logger.error(`REDIS (setex): Error setting ${key}: ${err.message}`)
      throw err
    }
  }

  async drop (keys: string[]): Promise<void> {
    if (Array.isArray(keys) && keys.length === 0) {
      return Promise.resolve()
    }
    const pipeline = this._redis.pipeline()
    keys.forEach(c => {
      pipeline.del(c)
    })
    return pipeline.exec()
  }
}
