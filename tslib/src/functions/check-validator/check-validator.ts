import {
  type ValidateCheckMessageV1,
  type MarkCheckMessageV1,
  type ReceivedCheckFunctionBindingEntity
} from '../../schemas/models'
import { type ILogger } from '../../common/logger'
import * as RA from 'ramda-adjunct'
import Moment from 'moment'
import { type ICompressionService, CompressionService } from '../../common/compression-service'
import { type ICheckNotificationMessage, CheckNotificationType } from '../../schemas/check-notification-message'
import { type ICheckValidationError } from './validators/validator-types'
import { ValidatorProvider, type IValidatorProvider } from './validators/validator.provider'
import { type ITableService, TableService } from '../../azure/table-service'
import { ReceivedCheckBindingEntityTransformer } from '../../services/receivedCheckBindingEntityTransformer'
import { SubmittedCheckVersion } from '../../schemas/SubmittedCheckVersion'

const functionName = 'check-validator'
const tableStorageTableName = 'receivedCheck'

export interface ICheckValidatorFunctionBindings {
  checkMarkingQueue: any[]
  checkNotificationQueue: ICheckNotificationMessage[]
}

export class CheckValidator {
  private readonly tableService: ITableService
  private readonly compressionService: ICompressionService
  private readonly validatorProvider: IValidatorProvider
  private readonly receivedCheckTransformer: ReceivedCheckBindingEntityTransformer

  constructor (tableService?: ITableService, compressionService?: ICompressionService, validatorProvider?: IValidatorProvider) {
    this.tableService = tableService ?? new TableService()
    this.compressionService = compressionService ?? new CompressionService()
    this.validatorProvider = validatorProvider ?? new ValidatorProvider()
    this.receivedCheckTransformer = new ReceivedCheckBindingEntityTransformer()
  }

  async validate (receivedCheckTable: unknown, validateCheckMessage: ValidateCheckMessageV1, logger: ILogger): Promise<ICheckValidatorFunctionBindings> {
    const output: ICheckValidatorFunctionBindings = {
      checkMarkingQueue: [],
      checkNotificationQueue: []
    }
    // this should fail outside of the catch as we wont be able to update the entity
    // without a reference to it and should rightly go on the dead letter queue
    const receivedCheck = this.findReceivedCheck(receivedCheckTable)
    logger.info(`${functionName}: received check to validate. checkVersion:${receivedCheck.checkVersion}`)
    let checkData

    try {
      if (receivedCheck.archive === undefined) {
        throw new Error(`${functionName}: message is missing [archive] property`)
      }
      if (receivedCheck.checkVersion === SubmittedCheckVersion.V2) {
        // UTF-16 compressed archive payload
        const decompressedArchive = this.compressionService.decompressFromUTF16(receivedCheck.archive)
        checkData = JSON.parse(decompressedArchive)
      } else if (receivedCheck.checkVersion === SubmittedCheckVersion.V3) {
        // base64 compressed archive payload
        const decompressedArchive = this.compressionService.decompressFromBase64(receivedCheck.archive)
        checkData = JSON.parse(decompressedArchive)
      } else {
        throw new Error(`${functionName}: unsupported check version:'${receivedCheck.checkVersion}'`)
      }
      await this.validateCheckStructure(checkData)
    } catch (error: any) {
      await this.setReceivedCheckAsInvalid(error.message, receivedCheck)
      // dispatch message to indicate validation failure
      const validationFailure: ICheckNotificationMessage = {
        checkCode: validateCheckMessage.checkCode,
        notificationType: CheckNotificationType.checkInvalid,
        version: 1
      }
      output.checkNotificationQueue = [validationFailure]
      logger.error(error.message)
      return output
    }

    await this.setReceivedCheckAsValid(receivedCheck, checkData)
    // dispatch message to indicate ready for marking
    const markingMessage: MarkCheckMessageV1 = {
      schoolUUID: validateCheckMessage.schoolUUID,
      checkCode: validateCheckMessage.checkCode,
      version: 1
    }
    output.checkMarkingQueue = [markingMessage]
    return output
  }

  private async setReceivedCheckAsValid (receivedCheckEntity: ReceivedCheckFunctionBindingEntity, checkData: any): Promise<void> {
    const transformedEntity = this.receivedCheckTransformer.transform(receivedCheckEntity)
    transformedEntity.validatedAt = Moment().toDate()
    transformedEntity.isValid = true
    transformedEntity.answers = JSON.stringify(checkData.answers)
    await this.tableService.mergeUpdateEntity(tableStorageTableName, transformedEntity)
  }

  private async setReceivedCheckAsInvalid (errorMessage: string, receivedCheckEntity: ReceivedCheckFunctionBindingEntity): Promise<void> {
    const transformedEntity = this.receivedCheckTransformer.transform(receivedCheckEntity)
    transformedEntity.processingError = errorMessage
    transformedEntity.validatedAt = Moment().toDate()
    transformedEntity.isValid = false
    await this.tableService.mergeUpdateEntity(tableStorageTableName, transformedEntity)
  }

  private findReceivedCheck (receivedCheckRef: unknown): ReceivedCheckFunctionBindingEntity {
    if (RA.isEmptyArray(receivedCheckRef)) {
      throw new Error(`${functionName}: received check reference is empty`)
    }
    if (!RA.isArray(receivedCheckRef)) {
      return receivedCheckRef as ReceivedCheckFunctionBindingEntity
    }
    const checkArray = receivedCheckRef as ReceivedCheckFunctionBindingEntity[]
    return checkArray[0]
  }

  private async validateCheckStructure (submittedCheck: any): Promise<void> {
    const validators = this.validatorProvider.getValidators()
    const validationErrors: ICheckValidationError[] = []
    for (let index = 0; index < validators.length; index++) {
      const validator = validators[index]
      const validationResult = validator.validate(submittedCheck)
      if (validationResult !== undefined) {
        validationErrors.push(validationResult)
      }
    }
    if (validationErrors.length > 0) {
      let validationErrorsMessage = `${functionName}: check validation failed. checkCode: ${submittedCheck.checkCode}`
      for (let index = 0; index < validationErrors.length; index++) {
        const error = validationErrors[index]
        validationErrorsMessage += `\n\t-\t${error.message}`
      }
      throw new Error(validationErrorsMessage)
    }

    // Async Validators - run these after the non-async validators to catch what we can before making expensive
    // network calls.
    const asyncValidators = this.validatorProvider.getAsyncValidators()
    const asyncValidationErrors: ICheckValidationError[] = []
    for (let index = 0; index < asyncValidators.length; index++) {
      const validator = asyncValidators[index]
      const validationResult = await validator.validate(submittedCheck)
      if (validationResult !== undefined) {
        asyncValidationErrors.push(validationResult)
      }
    }
    if (asyncValidationErrors.length > 0) {
      let asyncValidationErrorsMessage = `${functionName}: check validation failed. checkCode: ${submittedCheck.checkCode}`
      for (let index = 0; index < asyncValidationErrors.length; index++) {
        const error = asyncValidationErrors[index]
        asyncValidationErrorsMessage += `\n\t-\t${error.message}`
      }
      throw new Error(asyncValidationErrorsMessage)
    }
  }
}
