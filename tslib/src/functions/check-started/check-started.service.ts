import { type IRedisService, RedisService } from '../../caching/redis-service.js'
import * as R from 'ramda'
import config from '../../config.js'
import { CheckStartedDataService, type ICheckStartedDataService } from './check-started.data.service.js'

export class CheckStartedService {
  private readonly redisService: IRedisService
  private readonly checkStartedDataService: ICheckStartedDataService

  constructor (redisService?: IRedisService, checkStartedDataService?: ICheckStartedDataService) {
    if (redisService === undefined) {
      redisService = new RedisService()
    }
    this.redisService = redisService
    if (checkStartedDataService === undefined) {
      checkStartedDataService = new CheckStartedDataService()
    }
    this.checkStartedDataService = checkStartedDataService
  }

  async process (checkStartedMessage: ICheckStartedMessage): Promise<void> {
    const preparedCheckKey = await this.findPreparedCheckKey(checkStartedMessage.checkCode)
    if (preparedCheckKey === null) {
      return
    }
    const preparedCheck = await this.redisService.get(preparedCheckKey)
    let isLiveCheck = R.path(['config', 'practice'], preparedCheck) === false
    if (preparedCheck === null) {
      isLiveCheck = await this.checkStartedDataService.isLiveCheck(checkStartedMessage.checkCode)
    }
    if (isLiveCheck && !config.DevTestUtils.DisablePreparedCheckCacheDrop) {
      await this.redisService.drop([preparedCheckKey])
    }
    if (isLiveCheck) {
      await this.checkStartedDataService.updateCheckStartedDate(checkStartedMessage.checkCode,
        checkStartedMessage.clientCheckStartedAt)
    }
  }

  private buildCacheKey (checkCode: string): string {
    return `prepared-check-lookup:${checkCode.toUpperCase()}`
  }

  private async findPreparedCheckKey (checkCode: string): Promise<string | null> {
    const cacheLookupKeys = this.buildCacheLookupKeys(checkCode)
    for (const cacheLookupKey of cacheLookupKeys) {
      const preparedCheckKey = await this.redisService.get(cacheLookupKey) as string | null
      if (preparedCheckKey !== null) {
        return preparedCheckKey
      }
    }
    return null
  }

  private buildCacheLookupKeys (checkCode: string): string[] {
    const upperCaseKey = this.buildCacheKey(checkCode)
    const rawCaseKey = `prepared-check-lookup:${checkCode}`
    if (rawCaseKey === upperCaseKey) {
      return [upperCaseKey]
    }
    return [upperCaseKey, rawCaseKey]
  }
}
export interface ICheckStartedMessage {
  version: number
  checkCode: string
  clientCheckStartedAt: Date
}
