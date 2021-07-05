import { SubmittedCheckMessageV2 } from '../../schemas/models'
import { PreparedCheck } from '../../schemas/check-schemas/prepared-check'
import { ISubmittedCheckBuilderService as ICompletedCheckBuilderService, FakeCompletedCheckBuilderService } from './fake-completed-check-builder.service'
import { CompressionService, ICompressionService } from '../../common/compression-service'
import { IPreparedCheckService, PreparedCheckService } from '../../caching/prepared-check.service'
export interface CheckSubmitProxyOptions {
  correctAnswerCount: number
}

export class FakeSubmittedCheckMessageBuilderService {
  private readonly completedCheckPayloadBuilder: ICompletedCheckBuilderService
  private readonly compressionService: ICompressionService
  private readonly prepCheckService: IPreparedCheckService

  constructor (submittedCheckBuilder?: ICompletedCheckBuilderService, compressionService?: ICompressionService, prepCheckService?: IPreparedCheckService) {
    if (submittedCheckBuilder === undefined) {
      submittedCheckBuilder = new FakeCompletedCheckBuilderService()
    }
    this.completedCheckPayloadBuilder = submittedCheckBuilder
    if (compressionService === undefined) {
      compressionService = new CompressionService()
    }
    this.compressionService = compressionService
    if (prepCheckService === undefined) {
      prepCheckService = new PreparedCheckService()
    }
    this.prepCheckService = prepCheckService
  }

  async createSubmittedCheckMessage (checkCode: string, options: CheckSubmitProxyOptions): Promise<SubmittedCheckMessageV2> {
    const preparedCheckCacheValue = await this.prepCheckService.fetch(checkCode)
    if (preparedCheckCacheValue === undefined) {
      throw new Error(`prepared check not found in redis with checkCode:${checkCode}`)
    }
    const preparedCheck: PreparedCheck = preparedCheckCacheValue as PreparedCheck
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
}
