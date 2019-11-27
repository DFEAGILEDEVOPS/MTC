import { IRedisService, RedisService } from './redis.service'
import * as azureQueueService from './azure-queue.service'
import config from '../config'

export interface IPupilAuthenticationService {
  authenticate (schoolPin: string, pupilPin: string): Promise<object | undefined>
}

export class RedisPupilAuthenticationService implements IPupilAuthenticationService {

  private redisService: IRedisService

  constructor (redisService?: IRedisService) {
    if (redisService === undefined) {
      redisService = new RedisService()
    }
    this.redisService = redisService
  }

  async authenticate (schoolPin: string, pupilPin: string): Promise<object | undefined> {
    if (schoolPin.length === 0 || pupilPin.length === 0) {
      throw new Error('schoolPin and pupilPin cannot be an empty string')
    }
    const cacheKey = this.buildCacheKey(schoolPin, pupilPin)
    const preparedCheckEntry = await this.redisService.get(cacheKey)
    if (!preparedCheckEntry) {
      return
    }

    // Emit a successful login to the queue
    const pupilLoginMessage = {
      checkCode: preparedCheckEntry.checkCode,
      loginAt: new Date(),
      version: 1
    }
    azureQueueService.addMessage('pupil-login', pupilLoginMessage)
    if (preparedCheckEntry.config.practice === false) {
      await this.redisService.expire(cacheKey, config.RedisPreparedCheckExpiryInSeconds)
    }
    return preparedCheckEntry
  }

  private buildCacheKey (schoolPin: string, pupilPin: string): string {
    return `preparedCheck:${schoolPin}:${pupilPin}`
  }

}
