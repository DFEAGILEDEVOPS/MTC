import { type SubmittedCheckMessage } from '../../schemas/models'
import { type PreparedCheck } from '../../schemas/check-schemas/prepared-check'
import { type ICompletedCheckGeneratorService, FakeCompletedCheckGeneratorService } from './fake-completed-check-generator.service'
import { CompressionService, type ICompressionService } from '../../common/compression-service'
import { type IPreparedCheckService, PreparedCheckService } from '../../caching/prepared-check.service'
import { type IUtilSubmitCheckConfig } from './index'
import { type ILogger } from '../../common/logger'
import { type ValidCheck } from '../../schemas/check-schemas/validated-check'
import { SubmittedCheckVersion } from '../../schemas/SubmittedCheckVersion'

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

  private async getValidCheck (checkCode: string): Promise<ValidCheck> {
    const preparedCheckCacheValue = await this.prepCheckService.fetch(checkCode)
    if (preparedCheckCacheValue === undefined) {
      throw new Error(`prepared check not found in redis with checkCode:${checkCode}`)
    }
    const preparedCheck: PreparedCheck = preparedCheckCacheValue as PreparedCheck
    const validCheck = this.completedCheckGenerator.create(preparedCheck, this.funcConfig)
    validCheck.checkCode = checkCode
    return validCheck
  }

  async createV2Message (checkCode: string): Promise<SubmittedCheckMessage> {
    const validCheck = await this.getValidCheck(checkCode)
    const stringifiedJsonPayload = JSON.stringify(validCheck)
    const archive = this.compressionService.compressToUTF16(stringifiedJsonPayload)
    const submittedCheck: SubmittedCheckMessage = {
      checkCode: validCheck.checkCode,
      archive,
      schoolUUID: validCheck.schoolUUID,
      version: SubmittedCheckVersion.V2
    }
    return submittedCheck
  }

  async createV3Message (checkCode: string): Promise<SubmittedCheckMessage> {
    const validCheck = await this.getValidCheck(checkCode)
    const stringifiedJsonPayload = JSON.stringify(validCheck)
    const archive = this.compressionService.compressToBase64(stringifiedJsonPayload)
    const submittedCheck: SubmittedCheckMessage = {
      checkCode: validCheck.checkCode,
      archive,
      schoolUUID: validCheck.schoolUUID,
      version: SubmittedCheckVersion.V3
    }
    return submittedCheck
  }
}
