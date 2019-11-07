import { IRedisService, RedisService } from './redis.service'

export interface IPupilAuthenticationService {
  authenticate (schoolPin: string, pupilPin: string): Promise<object>
}

export class RedisPupilAuthenticationService implements IPupilAuthenticationService {

  private redisService: IRedisService

  constructor (redisService: IRedisService) {
    if (redisService === undefined) {
      redisService = new RedisService()
    }
    this.redisService = redisService
  }

  async authenticate (schoolPin: string, pupilPin: string): Promise<object> {
    if (schoolPin.length === 0 || pupilPin.length === 0) {
      throw new Error('schoolPin and pupilPin cannot be an empty string')
    }
    await this.redisService.get(this.buildCacheKey(schoolPin, pupilPin))
    return Promise.resolve({})
  }

  private buildCacheKey (schoolPin: string, pupilPin: string): string {
    return `preparedCheck:${schoolPin}:${pupilPin}`
  }

}
