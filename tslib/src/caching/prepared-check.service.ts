import { type IRedisService, RedisService } from './redis-service'
import redisKeyService from './redis-key.service'

export interface IPreparedCheckService {
  fetch (checkCode: string): Promise<unknown>
}

/**
 * encapsulates the 2-step process for looking up a prepared check via a check code.
 */
export class PreparedCheckService implements IPreparedCheckService {
  private readonly redisService: IRedisService

  constructor (redisService?: IRedisService) {
    if (redisService === undefined) {
      redisService = new RedisService()
    }
    this.redisService = redisService
  }

  async fetch (checkCode: string): Promise<unknown> {
    const lookupKey = redisKeyService.getPreparedCheckLookupKey(checkCode)
    const preparedCheckKey = await this.redisService.get(lookupKey)
    if (preparedCheckKey === undefined || preparedCheckKey === '') {
      return undefined
    }
    return this.redisService.get(preparedCheckKey as string)
  }
}
