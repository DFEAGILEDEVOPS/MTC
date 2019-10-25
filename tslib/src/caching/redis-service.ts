import Redis, { RedisOptions } from 'ioredis'
import config from '../config'
import * as Logger from '../common/logger'

export interface IRedisService {
  /**
   *
   * @param {string} key the unique string key of the redis entry to fetch
   * @returns {Promise<any | null>} an awaitable promise containing the item if it exists, or undefined if it does not
   */
  get (key: string): Promise<any | null>
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

  constructor (logger?: Logger.ILogger) {

    if (logger === undefined) {
      logger = new Logger.ConsoleLogger()
    }
    this._logger = logger

    const options: RedisOptions = {
      port: +config.Redis.Port,
      host: config.Redis.Host,
      password: config.Redis.Key
    }
    if (config.Redis.useTLS) {
      options.tls = {
        host: config.Redis.Host
      }
    }
    this._redis = new Redis(options)
  }

  async get (key: string): Promise<any | null> {
    try {
      const result = await this._redis.get(key)
      return result
    } catch (err) {
      this._logger.error(`REDIS (get): Error getting ${key}: ${err.message}`)
      throw err
    }
  }
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
}
