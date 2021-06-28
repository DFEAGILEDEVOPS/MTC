import { SubmittedCheckMessageV2 } from '../../schemas/models'
import { IRedisService, RedisService } from '../../caching/redis-service'
import { PreparedCheck } from '../../schemas/check-schemas/prepared-check'
import { ISubmittedCheckBuilderService, SubmittedCheckBuilderService } from './submitted-check-builder-service'

export interface CheckSubmitProxyOptions {
  isLiveCheck: boolean
  correctAnswerCount: number
  removeAnswers: boolean
}

export class CheckSubmitProxyService {
  private readonly redisService: IRedisService
  private readonly submittedCheckBuilder: ISubmittedCheckBuilderService

  constructor (redisService?: IRedisService, submittedCheckBuilder?: ISubmittedCheckBuilderService) {
    if (redisService === undefined) {
      redisService = new RedisService()
    }
    this.redisService = redisService
    if (submittedCheckBuilder === undefined) {
      submittedCheckBuilder = new SubmittedCheckBuilderService()
    }
    this.submittedCheckBuilder = submittedCheckBuilder
  }

  async submitCheck (checkCode: string, options: CheckSubmitProxyOptions): Promise<SubmittedCheckMessageV2> {
    const preparedCheckKey = this.buildCacheKey(checkCode)
    const preparedCheck: PreparedCheck = await this.redisService.get(preparedCheckKey) as PreparedCheck
    this.submittedCheckBuilder.create(preparedCheck)
    // TODO construct answers
    // TODO construct events
    const compressedArchive = 'todo'
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
