import { IRedisService, RedisService } from '../../caching/redis-service'
import { v4 as uuidv4 } from 'uuid'
import * as R from 'ramda'
import config from '../../config'

export interface ICheckStartedFunctionBindings {
  checkStartedTable: any[]
}

export class CheckStartedService {
  private readonly redisService: IRedisService

  constructor (redisService?: IRedisService) {
    if (redisService === undefined) {
      redisService = new RedisService()
    }
    this.redisService = redisService
  }

  async process (checkStartedMessage: ICheckStartedMessage, functionBindings: ICheckStartedFunctionBindings): Promise<void> {
    const cacheLookupKey = this.buildCacheKey(checkStartedMessage.checkCode)
    const preparedCheckKey = await this.redisService.get(cacheLookupKey) as string
    functionBindings.checkStartedTable = []
    functionBindings.checkStartedTable.push({
      PartitionKey: checkStartedMessage.checkCode.toLowerCase(),
      RowKey: uuidv4(),
      clientCheckStartedAt: checkStartedMessage.clientCheckStartedAt
    })
    const preparedCheck = await this.redisService.get(preparedCheckKey)
    const isLiveCheck = R.path(['config', 'practice'], preparedCheck) === false
    if (isLiveCheck && !config.DevTestUtils.DisablePreparedCheckCacheDrop) {
      await this.redisService.drop([preparedCheckKey])
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
