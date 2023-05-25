import { type IRedisService, RedisService } from '../../caching/redis-service'
import * as R from 'ramda'
import config from '../../config'
import { CheckStartedDataService, type ICheckStartedDataService } from './check-started.data.service'

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
    const cacheLookupKey = this.buildCacheKey(checkStartedMessage.checkCode)
    const preparedCheckKey = await this.redisService.get(cacheLookupKey) as string
    const preparedCheck = await this.redisService.get(preparedCheckKey)
    const isLiveCheck = R.path(['config', 'practice'], preparedCheck) === false
    if (isLiveCheck && !config.DevTestUtils.DisablePreparedCheckCacheDrop) {
      await this.redisService.drop([preparedCheckKey])
    }
    if (isLiveCheck) {
      await this.checkStartedDataService.updateCheckStartedDate(checkStartedMessage.checkCode,
        checkStartedMessage.clientCheckStartedAt)
    }
  }

  private buildCacheKey (checkCode: string): string {
    return `prepared-check-lookup:${checkCode}`
  }
}
export interface ICheckStartedMessage {
  version: number
  checkCode: string
  clientCheckStartedAt: Date
}
