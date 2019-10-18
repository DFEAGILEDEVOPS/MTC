import { IAsyncTableService, AsyncTableService } from '../../azure/async-table-service'
import { ValidateCheckMessageV1, ReceivedCheck, MarkCheckMessageV1 } from '../../message-schemas'
import { ILogger } from '../../common/ILogger'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import checkSchema from '../../message-schemas/complete-check.v1.json'
import Moment from 'moment'
import { ICompressionService, CompressionService } from '../../common/compression-service'

export interface ICheckValidatorFunctionBindings {
  receivedCheckTable: Array<any>
  checkMarkingQueue: Array<any>
}

export class CheckValidatorV1 {
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

  async validate (functionBindings: ICheckValidatorFunctionBindings, validateCheckMessage: ValidateCheckMessageV1, logger: ILogger): Promise<void> {
    // this should fail outside of the catch as we wont be able to update the entity
    // without a reference to it and should rightly go on the dead letter queue
    const receivedCheck = this.findReceivedCheck(functionBindings.receivedCheckTable)
    let checkData
    try {
      this.detectArchive(receivedCheck)
      const decompressedString = this._compressionService.decompress(receivedCheck.archive)
      checkData = JSON.parse(decompressedString)
      this.validateCheckStructure(checkData)
    } catch (error) {
      await this.setReceivedCheckAsInvalid(error.message, receivedCheck)
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

  private async setReceivedCheckAsValid (receivedCheck: ReceivedCheck, checkData: any) {
    receivedCheck.validatedAt = Moment().toDate()
    receivedCheck.isValid = true
    receivedCheck.answers = JSON.stringify(checkData.answers)
    await this._tableService.replaceEntityAsync('receivedCheck', receivedCheck)
  }

  private async setReceivedCheckAsInvalid (errorMessage: string, receivedCheck: ReceivedCheck) {
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
