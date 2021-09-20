import { IAsyncTableService, AsyncTableService } from '../../azure/storage-helper'
import { ReceivedCheckTableEntity, ValidateCheckMessageV1, MarkCheckMessageV1 } from '../../schemas/models'
import { ILogger } from '../../common/logger'
import * as RA from 'ramda-adjunct'
import Moment from 'moment'
import { ICompressionService, CompressionService } from '../../common/compression-service'
import { ICheckNotificationMessage, CheckNotificationType } from '../../schemas/check-notification-message'
import { ICheckValidationError } from './validators/validator-types'
import { ValidatorProvider } from './validators/validator.provider'

export interface ICheckValidatorFunctionBindings {
  receivedCheckTable: any[]
  checkMarkingQueue: any[]
  checkNotificationQueue: ICheckNotificationMessage[]
}

export class CheckValidator {
  private readonly tableService: IAsyncTableService
  private readonly compressionService: ICompressionService
  private readonly validatorProvider: ValidatorProvider

  constructor (tableService?: IAsyncTableService, compressionService?: ICompressionService) {
    if (tableService !== undefined) {
      this.tableService = tableService
    } else {
      this.tableService = new AsyncTableService()
    }

    if (compressionService !== undefined) {
      this.compressionService = compressionService
    } else {
      this.compressionService = new CompressionService()
    }
    this.validatorProvider = new ValidatorProvider()
  }

  async validate (functionBindings: ICheckValidatorFunctionBindings, validateCheckMessage: ValidateCheckMessageV1, logger: ILogger): Promise<void> {
    // this should fail outside of the catch as we wont be able to update the entity
    // without a reference to it and should rightly go on the dead letter queue
    const receivedCheck = this.findReceivedCheck(functionBindings.receivedCheckTable)
    let checkData
    try {
      this.detectArchive(receivedCheck)
      const decompressedString = this.compressionService.decompress(receivedCheck.archive)
      checkData = JSON.parse(decompressedString)
      this.validateCheckStructureV2(checkData)
    } catch (error) {
      await this.setReceivedCheckAsInvalid(error.message, receivedCheck)
      // dispatch message to indicate validation failure
      const validationFailure: ICheckNotificationMessage = {
        checkCode: validateCheckMessage.checkCode,
        notificationType: CheckNotificationType.checkInvalid,
        version: 1
      }
      functionBindings.checkNotificationQueue = [validationFailure]
      logger.error(error.message)
      return
    }

    await this.setReceivedCheckAsValid(receivedCheck, checkData)
    // dispatch message to indicate ready for marking
    const markingMessage: MarkCheckMessageV1 = {
      schoolUUID: validateCheckMessage.schoolUUID,
      checkCode: validateCheckMessage.checkCode,
      version: 1
    }

    functionBindings.checkMarkingQueue = [markingMessage]
  }

  private async setReceivedCheckAsValid (receivedCheckTableEntity: ReceivedCheckTableEntity, checkData: any): Promise<void> {
    receivedCheckTableEntity.validatedAt = Moment().toDate()
    receivedCheckTableEntity.isValid = true
    receivedCheckTableEntity.answers = JSON.stringify(checkData.answers)
    await this.tableService.replaceEntityAsync('receivedCheck', receivedCheckTableEntity)
  }

  private async setReceivedCheckAsInvalid (errorMessage: string, receivedCheck: ReceivedCheckTableEntity): Promise<void> {
    receivedCheck.processingError = errorMessage
    receivedCheck.validatedAt = Moment().toDate()
    receivedCheck.isValid = false
    await this.tableService.replaceEntityAsync('receivedCheck', receivedCheck)
  }

  private findReceivedCheck (receivedCheckRef: any[]): any {
    if (RA.isEmptyArray(receivedCheckRef)) {
      throw new Error('received check reference is empty')
    }
    return receivedCheckRef[0]
  }

  private detectArchive (message: Record<string, unknown>): void {
    if (!('archive' in message)) {
      throw new Error('message is missing [archive] property')
    }
  }

  private validateCheckStructureV2 (submittedCheck: any): void {
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
      let validationErrorsMessage = `check validation failed. checkCode: ${submittedCheck.checkCode}`
      for (let index = 0; index < validationErrors.length; index++) {
        const error = validationErrors[index]
        validationErrorsMessage += `\n\t-\t${error.message}`
      }
      throw new Error(validationErrorsMessage)
    }
  }
}
