import * as R from 'ramda'
import * as moment from 'moment'
import { IRedisService, RedisService } from './redis.service'
import * as azureQueueService from './azure-queue.service'
import config from '../config'
import { IQueueMessageService, SbQueueMessageService } from './queue-message.service'

export interface IPupilAuthenticationService {
  authenticate (schoolPin: string, pupilPin: string): Promise<object | undefined>
}

export interface IPupilLoginMessage {
  checkCode: string
  loginAt: Date
  practice: boolean
  version: number
}

export class RedisPupilAuthenticationService implements IPupilAuthenticationService {

  private redisService: IRedisService
  private queueService: IQueueMessageService

  constructor (redisService?: IRedisService, queueService?: IQueueMessageService) {
    if (redisService === undefined) {
      redisService = new RedisService()
    }
    this.redisService = redisService
    if (queueService === undefined) {
      queueService = new SbQueueMessageService()
    }
    this.queueService = queueService
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
    const pinExpiresAtUtc = R.prop('pinExpiresAtUtc', preparedCheckEntry)
    const pinValidFromUtc = R.prop('pinValidFromUtc', preparedCheckEntry)
    const currentDateTime = moment.utc()
    if (moment.utc(pinValidFromUtc).isAfter(currentDateTime) || moment.utc(pinExpiresAtUtc).isBefore(currentDateTime)) {
      return
    }

    if (preparedCheckEntry.config.practice === false) {
      await this.redisService.expire(cacheKey, config.RedisPreparedCheckExpiryInSeconds)
    }
    // Emit a successful login to the queue
    const pupilLoginMessage: IPupilLoginMessage = {
      checkCode: preparedCheckEntry.checkCode,
      loginAt: new Date(),
      version: 1,
      practice: preparedCheckEntry.config.practice
    }
    await this.queueService.dispatch({
      body: pupilLoginMessage
    })
    return preparedCheckEntry
  }

  private buildCacheKey (schoolPin: string, pupilPin: string): string {
    return `preparedCheck:${schoolPin}:${pupilPin}`
  }

}
