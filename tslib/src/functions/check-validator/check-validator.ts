
import { IAsyncTableService, AsyncTableService } from '../../azure/storage-helper'
import { ReceivedCheckTableEntity, ValidateCheckMessageV1, MarkCheckMessageV1 } from '../../schemas/models'
import { ILogger } from '../../common/logger'
import * as RA from 'ramda-adjunct'
import Moment from 'moment'
import { ICompressionService, CompressionService } from '../../common/compression-service'
import { ICheckNotificationMessage, CheckNotificationType } from '../../schemas/check-notification-message'
import { SubmittedCheck } from '../../schemas/check-schemas/submitted-check'

const requiredSubmittedCheckProperties = [
  'answers',
  'audit',
  'checkCode',
  'config',
  'inputs',
  'pupil',
  'questions',
  'school',
  'tokens'
]

export interface ICheckValidatorFunctionBindings {
  receivedCheckTable: any[]
  checkMarkingQueue: any[]
  checkNotificationQueue: ICheckNotificationMessage[]
}

export class CheckValidator {
  private readonly tableService: IAsyncTableService
  private readonly compressionService: ICompressionService

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
      this.validateCheckStructure(checkData)
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

  private validateCheckStructure (check: Record<string, unknown>): void {
    const errorMessagePrefix = 'submitted check is missing the following properties:'
    const missingProperties: string[] = []
    for (let index = 0; index < requiredSubmittedCheckProperties.length; index++) {
      const propertyName = requiredSubmittedCheckProperties[index]
      if (!(propertyName in check)) {
        missingProperties.push(propertyName)
      }
    }
    const missingPropertyNames = missingProperties.join()
    if (!RA.isEmptyArray(missingProperties)) {
      throw new Error(`${errorMessagePrefix} ${missingPropertyNames}`)
    }
  }

  private validateAnswers (checkData: SubmittedCheck): void {
    if (checkData.config.practice) return
    if (checkData.answers.length < 25) {
      throw new Error(`submitted check only has ${checkData.answers.length} answers.`)
    }
    for (let index = 0; index < checkData.answers.length; index++) {
      const answerEntry = checkData.answers[index]
      if (typeof answerEntry.answer !== 'string') {
        throw new Error(`answer ${answerEntry.sequenceNumber} is not of required type (string)`)
      }
    }
  }
}
