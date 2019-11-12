import { IRedisService, RedisService } from '../../caching/redis-service'
import v4 from 'uuid'

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
    const preparedCheckKey = await this.redisService.get(checkStartedMessage.checkCode)
    await this.redisService.drop([preparedCheckKey])
    functionBindings.checkStartedTable.push({
      PartitionKey: checkStartedMessage.checkCode,
      RowKey: v4(),
      clientCheckStartedAt: checkStartedMessage.clientCheckStartedAt
    })
  }
}
export interface ICheckStartedMessage {
  version: number
  checkCode: string
  clientCheckStartedAt: Date
}
