import { IRedisService, RedisService } from '../../caching/redis-service'

export class CheckStartedService {

  private redisService: IRedisService

  constructor (redisService?: IRedisService) {
    if (redisService === undefined){
      redisService = new RedisService()
    }
    this.redisService = redisService
  }

  async process (checkCode: string): Promise<void> {
    const preparedCheckKey = await this.redisService.get(checkCode)
    await this.redisService.drop([preparedCheckKey])
  }
}
export interface ICheckStartedMessage {
  version: number
  checkCode: string
  clientCheckStartedAt: Date
}
