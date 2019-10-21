import Redis, { RedisOptions } from 'ioredis'
import * as config from '../config'
import * as Logger from '../common/ILogger'

export interface IRedisService {
  /**
   *
   * @param {string} key the unique string key of the redis entry to fetch
   * @returns {Promise<any | undefined>} an awaitable promise containing the item if it exists, or undefined if it does not
   */
  get (key: string): Promise<any>
  /**
   *
   * @param {string} key the unique string key of the redis entry to persist
   * @param {object | string} value the item to persist in redis cache
   * @param {number} ttl how long to store the item in seconds
   * @returns {Promise<void} an awaitable promise
   */
  setex (key: string, value: string | object, ttl: number): Promise<void>
}

export class RedisService implements IRedisService {
  private _redis: Redis.Redis
  private _logger: Logger.ILogger

  constructor (logger: Logger.ILogger) {
    this._logger = logger
    const options: RedisOptions = {
      port: +config.default.Redis.Port,
      host: config.default.Redis.Host,
      password: config.default.Redis.Key
    }
    if (config.default.Redis.useTLS) {
      options.tls = {
        host: config.default.Redis.Host
      }
    }
    this._redis = new Redis(options)
  }

  async get (key: string) {
    try {
      const result = await this._redis.get(key)
      return result
    } catch (err) {
      this._logger.error(`REDIS (get): Error getting ${key}: ${err.message}`)
      throw err
    }
  }
  async setex (key: string, value: string | object, ttl: number) {
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
}
