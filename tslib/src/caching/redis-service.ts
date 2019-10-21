import Redis, { RedisOptions } from 'ioredis'
import * as config from '../config'
import * as Logger from '../common/ILogger'

export interface IRedisService {
  get (key: string): Promise<any>
  setex (key: string, value: string | object, ttl: number): Promise<any>
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
      if (!result) {
        return false
      }
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
      return true
    } catch (err) {
      this._logger.error(`REDIS (setex): Error setting ${key}: ${err.message}`)
      throw err
    }
  }
}
