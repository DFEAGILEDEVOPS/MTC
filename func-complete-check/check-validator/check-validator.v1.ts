import { IAsyncTableService, AsyncTableService } from '../lib/storage-helper'
import { ValidateCheckMessageV1, ReceivedCheck } from '../typings/message-schemas'
import { ILogger } from '../lib/ILogger'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import checkSchema from '../messages/complete-check.v1.json'
import Moment from 'moment'
import { ICompressionService, CompressionService } from '../lib/compression-service'

export interface ICheckValidator {
  validate (receivedCheckData: Array<object>, validateCheckMessage: ValidateCheckMessageV1, logger: ILogger): void
}

export class CheckValidatorV1 implements ICheckValidator {
  private _tableService: IAsyncTableService
  private _compressionService: ICompressionService

  constructor (tableService?: IAsyncTableService, compressionService?: ICompressionService) {
    if (tableService !== undefined) {
      this._tableService = tableService
    } else {
      this._tableService = new AsyncTableService()
    }

    if (compressionService !== undefined) {
      this._compressionService = compressionService
    } else {
      this._compressionService = new CompressionService()
    }
  }

  async validate (receivedCheckReference: Array<any>, validateCheckMessage: ValidateCheckMessageV1, logger: ILogger): Promise<void> {
    // this should fail outside of the catch as we wont be able to update the entity
    // without a reference to it and should rightly go on the dead letter queue
    const receivedCheck = this.findReceivedCheck(receivedCheckReference)
    try {
      this.detectArchive(receivedCheck)
      const decompressedString = this._compressionService.decompress(receivedCheck.archive)
      const checkData = JSON.parse(decompressedString)
      this.validateCheckStructure(checkData)
      // all failures must be caught and recorded against the entity
    } catch (error) {
      await this.updateReceivedCheckWithErrorDetails(error.message, receivedCheck)
      logger.error(error.message)
      return
    }
  }

  private async updateReceivedCheckWithErrorDetails (errorMessage: string, receivedCheck: ReceivedCheck) {
    receivedCheck.validationError = errorMessage
    receivedCheck.validatedAt = Moment().toDate()
    receivedCheck.isValid = false
    await this._tableService.replaceEntityAsync('receivedCheck', receivedCheck)
  }

  private findReceivedCheck (receivedCheckRef: Array<any>): any {
    if (RA.isEmptyArray(receivedCheckRef)) {
      throw new Error('received check reference is empty')
    }
    return receivedCheckRef[0]
  }

  private detectArchive (message: object) {
    if (!message.hasOwnProperty('archive')) {
      throw new Error('message is missing [archive] property')
    }
  }

  private validateCheckStructure (check: object) {
    const allProperties = Object.getOwnPropertyNames(checkSchema)
    const errorMessagePrefix = 'submitted check is missing the following properties:'
    const missingProperties: string[] = []
    const requiredProperties = R.without(['version'], allProperties)
    for (let index = 0; index < requiredProperties.length; index++) {
      const propertyName = requiredProperties[index]
      if (!check.hasOwnProperty(propertyName)) {
        missingProperties.push(propertyName)
      }
    }
    const missingPropertyNames = missingProperties.join()
    if (!RA.isEmptyArray(missingProperties)) {
      throw new Error(`${errorMessagePrefix} ${missingPropertyNames}`)
    }
  }
}
