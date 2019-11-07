import Redis, { RedisOptions } from 'ioredis'
import config from '../config'
import { IRedisService, RedisService } from './redis.service'

export interface IPupilAuthenticationService {
  authenticate (schoolPin: string, pupilPin: number): Promise<object>
}

export class RedisPupilAuthenticationService implements IPupilAuthenticationService {

  private redisService: IRedisService

  constructor (redisService: IRedisService) {
    if (redisService === undefined) {
      redisService = new RedisService()
    }
    this.redisService = redisService
  }

  async authenticate (schoolPin: string, pupilPin: number): Promise<object> {
    await this.redisService.get(`preparedCheck:${schoolPin}:${pupilPin}`)
    return Promise.resolve({})
  }

}
