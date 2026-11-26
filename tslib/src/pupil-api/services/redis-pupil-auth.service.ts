import * as R from 'ramda'
import moment from 'moment'
import type { IRedisService } from './redis.service.js'
import { RedisService } from './redis.service.js'
import config from '../config.js'
import { ServiceBusQueueService } from '../../azure/service-bus.queue.service.js'
import type { IServiceBusQueueService } from '../../azure/service-bus.queue.service.js'
import { PingService } from './ping.service.js'
import { ServiceBusQueueNames } from '../../azure/service-bus-queue.names.js'
import { CheckStartedDataService, type ICheckStartedDataService } from '../../functions/check-started/check-started.data.service.js'
import { EmergencyOffSwitchEnabledError } from '../errors/emergency-off-switch-enabled.error.js'
import { EmergencyOffSwitchService } from './emergency-off-switch.service.js'

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
  private readonly queueService: IServiceBusQueueService
  private readonly pingService: PingService
  private readonly emergencyOffSwitchService: Pick<EmergencyOffSwitchService, 'getState'>
  private readonly checkStartedDataService: Pick<ICheckStartedDataService, 'hasStarted'>

  constructor (
    redisService?: IRedisService,
    queueService?: IServiceBusQueueService,
    emergencyOffSwitchService?: Pick<EmergencyOffSwitchService, 'getState'>,
    checkStartedDataService?: Pick<ICheckStartedDataService, 'hasStarted'>
  ) {
    if (redisService === undefined) {
      redisService = new RedisService()
    }
    this.redisService = redisService
    if (queueService === undefined) {
      queueService = new ServiceBusQueueService()
    }
    this.queueService = queueService
    this.pingService = new PingService()
    this.emergencyOffSwitchService = emergencyOffSwitchService ?? new EmergencyOffSwitchService()
    this.checkStartedDataService = checkStartedDataService ?? new CheckStartedDataService()
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

    const emergencyOffSwitchState = await this.emergencyOffSwitchService.getState()
    if (emergencyOffSwitchState.isEnabled) {
      const checkHasStarted = await this.checkStartedDataService.hasStarted(preparedCheckEntry.checkCode)
      if (!checkHasStarted) {
        throw new EmergencyOffSwitchEnabledError()
      }
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
    }, ServiceBusQueueNames.pupilLogin)
    return preparedCheckEntry
  }

  private buildCacheKey (schoolPin: string, pupilPin: string): string {
    return `preparedCheck:${schoolPin}:${pupilPin}`
  }
}
