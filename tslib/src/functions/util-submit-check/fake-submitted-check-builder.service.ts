import { SubmittedCheckMessageV2 } from '../../schemas/models'
import { IRedisService, RedisService } from '../../caching/redis-service'
import { PreparedCheck } from '../../schemas/check-schemas/prepared-check'
import { ISubmittedCheckBuilderService as ICompletedCheckBuilderService, FakeCompletedCheckBuilderService } from './fake-completed-check-builder.service'
import { CompressionService, ICompressionService } from '../../common/compression-service'
export interface CheckSubmitProxyOptions {
  isLiveCheck: boolean
  correctAnswerCount: number
  answerCount: number
}

export class SubmittedCheckMessageBuilderService {
  private readonly redisService: IRedisService
  private readonly completedCheckPayloadBuilder: ICompletedCheckBuilderService
  private readonly compressionService: ICompressionService

  constructor (redisService?: IRedisService, submittedCheckBuilder?: ICompletedCheckBuilderService, compressionService?: ICompressionService) {
    if (redisService === undefined) {
      redisService = new RedisService()
    }
    this.redisService = redisService
    if (submittedCheckBuilder === undefined) {
      submittedCheckBuilder = new FakeCompletedCheckBuilderService()
    }
    this.completedCheckPayloadBuilder = submittedCheckBuilder
    if (compressionService === undefined) {
      compressionService = new CompressionService()
    }
    this.compressionService = compressionService
  }

  async createSubmittedCheckMessage (checkCode: string, options: CheckSubmitProxyOptions): Promise<SubmittedCheckMessageV2> {
    const preparedCheckKey = this.buildCacheKey(checkCode)
    const preparedCheck: PreparedCheck = await this.redisService.get(preparedCheckKey) as PreparedCheck
    const checkPayload = this.completedCheckPayloadBuilder.create(preparedCheck)
    const archive = this.compressionService.compress(JSON.stringify(checkPayload))
    const submittedCheck: SubmittedCheckMessageV2 = {
      checkCode: checkCode,
      archive: archive,
      schoolUUID: preparedCheck.school.uuid,
      version: 2
    }
    return submittedCheck
  }

  private buildCacheKey (checkCode: string): string {
    return `prepared-check-lookup:${checkCode}`
  }
}
