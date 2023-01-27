import { SubmittedCheckMessageV2 } from '../../schemas/models'
import { PreparedCheck } from '../../schemas/check-schemas/prepared-check'
import { ICompletedCheckGeneratorService, FakeCompletedCheckGeneratorService } from './fake-completed-check-generator.service'
import { CompressionService, ICompressionService } from '../../common/compression-service'
import { IPreparedCheckService, PreparedCheckService } from '../../caching/prepared-check.service'
import { IUtilSubmitCheckConfig } from './index'
import { ILogger } from '../../common/logger'

export class FakeSubmittedCheckMessageGeneratorService {
  private readonly completedCheckGenerator: ICompletedCheckGeneratorService
  private readonly compressionService: ICompressionService
  private readonly prepCheckService: IPreparedCheckService
  private funcConfig: IUtilSubmitCheckConfig | undefined
  private logger: ILogger | undefined

  constructor (submittedCheckBuilder?: ICompletedCheckGeneratorService, compressionService?: ICompressionService, prepCheckService?: IPreparedCheckService) {
    if (submittedCheckBuilder === undefined) {
      submittedCheckBuilder = new FakeCompletedCheckGeneratorService()
    }
    this.completedCheckGenerator = submittedCheckBuilder
    if (compressionService === undefined) {
      compressionService = new CompressionService()
    }
    this.compressionService = compressionService
    if (prepCheckService === undefined) {
      prepCheckService = new PreparedCheckService()
    }
    this.prepCheckService = prepCheckService
  }

  setConfig (funcConfig: IUtilSubmitCheckConfig): void {
    this.logger?.info('funcConfig is', funcConfig)
    this.funcConfig = funcConfig
  }

  setLogger (logger: ILogger): void {
    this.logger = logger
  }

  async createSubmittedCheckMessage (checkCode: string): Promise<SubmittedCheckMessageV2> {
    const preparedCheckCacheValue = await this.prepCheckService.fetch(checkCode)
    if (preparedCheckCacheValue === undefined) {
      throw new Error(`prepared check not found in redis with checkCode:${checkCode}`)
    }
    const preparedCheck: PreparedCheck = preparedCheckCacheValue as PreparedCheck
    const checkPayload = this.completedCheckGenerator.create(preparedCheck, this.funcConfig)
    const stringifiedJsonPayload = JSON.stringify(checkPayload)
    const archive = this.compressionService.compress(stringifiedJsonPayload)
    const submittedCheck: SubmittedCheckMessageV2 = {
      checkCode: checkCode,
      archive: archive,
      schoolUUID: preparedCheck.school.uuid,
      version: 2
    }
    return submittedCheck
  }
}
