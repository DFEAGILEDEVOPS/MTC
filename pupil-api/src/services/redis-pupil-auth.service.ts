import { IRedisService, BasicRedisService } from './redis.service'
import * as azureQueueService from './azure-queue.service'

export interface IPupilAuthenticationService {
  authenticate (schoolPin: string, pupilPin: string): Promise<object>
}

export class RedisPupilAuthenticationService implements IPupilAuthenticationService {

  private redisService: IRedisService
  private eightHoursInSeconds: number = 28800

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
    const checkStartedLookupKey = this.buildCheckStartedLookupKey(hydratedCacheItem.checkCode)
    await this.redisService.setex(checkStartedLookupKey, cacheKey, this.eightHoursInSeconds)
    return hydratedCacheItem
  }

  private buildCheckStartedLookupKey (checkCode: string) {
    return `check-started-check-lookup:${checkCode}`
  }

  private buildCacheKey (schoolPin: string, pupilPin: string): string {
    return `preparedCheck:${schoolPin}:${pupilPin}`
  }

}
