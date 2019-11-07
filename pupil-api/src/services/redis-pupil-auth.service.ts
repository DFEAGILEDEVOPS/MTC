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
    const cacheKey = this.buildCacheKey(schoolPin, pupilPin)
    const cacheItem = await this.redisService.get(cacheKey)
    console.log('cache item is...')
    console.dir(cacheItem)
    if (!cacheItem) {
      return null
    }
    return cacheItem
  }

  private buildCacheKey (schoolPin: string, pupilPin: string): string {
    return `preparedCheck:${schoolPin}:${pupilPin}`
  }

}
