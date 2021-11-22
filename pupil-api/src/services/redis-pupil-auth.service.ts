import * as R from 'ramda'
import * as moment from 'moment'
import { IRedisService, RedisService } from './redis.service'
import config from '../config'
import { IQueueMessageService, SbQueueMessageService } from './queue-message.service'
import { PingService } from './ping.service'

export interface IPupilAuthenticationService {
  authenticate (schoolPin?: string, pupilPin?: string, buildVersion?: string): Promise<object | undefined>
}

export interface IPupilLoginMessage {
  checkCode: string
  loginAt: Date
  practice: boolean
  version: number
  clientBuildVersion: string
  apiBuildVersion: string
}

export class RedisPupilAuthenticationService implements IPupilAuthenticationService {
  private readonly redisService: IRedisService
  private readonly queueService: IQueueMessageService
  private readonly pingService: PingService

  constructor (redisService?: IRedisService, queueService?: IQueueMessageService) {
    if (redisService === undefined) {
      redisService = new RedisService()
    }
    this.redisService = redisService
    if (queueService === undefined) {
      queueService = new SbQueueMessageService()
    }
    this.queueService = queueService
    this.pingService = new PingService()
  }

  async authenticate (schoolPin?: string, pupilPin?: string, buildVersion?: string): Promise<object | undefined> {
    if (schoolPin === undefined || schoolPin.length === 0) {
      throw new Error('schoolPin is required')
    }

    if (pupilPin === undefined || pupilPin.length === 0) {
      throw new Error('pupilPin is required')
    }

    if (buildVersion === undefined || buildVersion.length === 0) {
      throw new Error('buildVersion is required')
    }

    const cacheKey = this.buildCacheKey(schoolPin, pupilPin)
    const preparedCheckEntry = await this.redisService.get(cacheKey)
    if (preparedCheckEntry === undefined) {
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
      checkCode: preparedCheckEntry.checkCode.toLowerCase(),
      loginAt: new Date(),
      version: 1,
      practice: preparedCheckEntry.config.practice,
      clientBuildVersion: buildVersion,
      apiBuildVersion: await this.pingService.getBuildNumber()
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
