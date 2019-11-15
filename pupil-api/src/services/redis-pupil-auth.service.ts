import { IRedisService, BasicRedisService } from './redis.service'
import * as azureQueueService from './azure-queue.service'
import config from '../config'

export interface IPupilAuthenticationService {
  authenticate (schoolPin: string, pupilPin: string): Promise<object>
}

export class RedisPupilAuthenticationService implements IPupilAuthenticationService {

  private redisService: IRedisService

  constructor (redisService?: IRedisService) {
    if (redisService === undefined) {
      redisService = new BasicRedisService()
    }
    this.redisService = redisService
  }

  async authenticate (schoolPin: string, pupilPin: string): Promise<object> {
    if (schoolPin.length === 0 || pupilPin.length === 0) {
      throw new Error('schoolPin and pupilPin cannot be an empty string')
    }
    const cacheKey = this.buildCacheKey(schoolPin, pupilPin)
    const cacheItem = await this.redisService.get(cacheKey)
    if (!cacheItem) {
      return null
    }
    const hydratedCacheItem = JSON.parse(cacheItem)
    // Emit a successful login to the queue
    const pupilLoginMessage = {
      checkCode: hydratedCacheItem.checkCode,
      loginAt: new Date(),
      version: 1
    }
    azureQueueService.addMessage('pupil-login', pupilLoginMessage)

    // update TTL to 30 minutes now it's been collected...
    await this.redisService.setex(cacheKey, cacheItem, config.RedisPreparedCheckExpiryInSeconds)
    return hydratedCacheItem
  }

  private buildCacheKey (schoolPin: string, pupilPin: string): string {
    return `preparedCheck:${schoolPin}:${pupilPin}`
  }

}
