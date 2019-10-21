import Redis, { RedisOptions } from 'ioredis'

export interface IRedisService {
  get (key: string): Promise<any>
  setex (key: string, value: string, ttl: number): Promise<any>
}
export class RedisService implements IRedisService {
  private _redis: Redis.Redis

  constructor (options: RedisOptions) {
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
      throw err
    }
  }
  async setex (key: string, value: string, ttl: number) {
    throw new Error('Method not implemented.')
  }
}
