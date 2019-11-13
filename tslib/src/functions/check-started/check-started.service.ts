import { IRedisService, RedisService } from '../../caching/redis-service'
import v4 from 'uuid/v4'

export interface ICheckStartedFunctionBindings {
  checkStartedTable: Array<any>
}

export class CheckStartedService {

  private redisService: IRedisService

  constructor (redisService?: IRedisService) {
    if (redisService === undefined) {
      redisService = new RedisService()
    }
    this.redisService = redisService
  }

  async process (checkStartedMessage: ICheckStartedMessage, functionBindings: ICheckStartedFunctionBindings): Promise<void> {
    const cacheLookupKey = this.buildCacheKey(checkStartedMessage.checkCode)
    const preparedCheckKey = await this.redisService.get(cacheLookupKey)
    functionBindings.checkStartedTable.push({
      PartitionKey: checkStartedMessage.checkCode,
      RowKey: v4(),
      clientCheckStartedAt: checkStartedMessage.clientCheckStartedAt
    })
    return this.redisService.drop([preparedCheckKey])
  }

  private buildCacheKey (checkCode: string): string {
    return `check-started-check-lookup:${checkCode}`
  }
}
export interface ICheckStartedMessage {
  version: number
  checkCode: string
  clientCheckStartedAt: Date
}
