import { SubmittedCheckMessageV2 } from '../../schemas/models'
import { IRedisService, RedisService } from '../../caching/redis-service'
import { PreparedCheck } from '../../schemas/check-schemas/prepared-check'

export interface CheckSubmitProxyOptions {
  isLiveCheck: boolean
  correctAnswerCount: number
  removeAnswers: boolean
}

export class CheckSubmitProxyService {
  private readonly redisService: IRedisService

  constructor (redisService?: IRedisService) {
    if (redisService === undefined) {
      redisService = new RedisService()
    }
    this.redisService = redisService
  }

  async submitCheck (checkCode: string, options: CheckSubmitProxyOptions): Promise<SubmittedCheckMessageV2> {
    const preparedCheckKey = this.buildCacheKey(checkCode)
    const preparedCheck: PreparedCheck = await this.redisService.get(preparedCheckKey) as PreparedCheck
    // TODO construct answers
    // TODO construct events
    const compressedArchive = 'TODO'
    const submittedCheck: SubmittedCheckMessageV2 = {
      checkCode: checkCode,
      archive: compressedArchive,
      schoolUUID: preparedCheck.school.uuid,
      version: 2
    }
    return submittedCheck
  }

  private buildCacheKey (checkCode: string): string {
    return `prepared-check-lookup:${checkCode}`
  }
}
