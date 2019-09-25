import { IAsyncTableService, AsyncTableService } from '../lib/storage-helper'
import { Context, Logger } from '@azure/functions'
import { ValidateCheckMessageV1 } from '../typings/message-schemas'
import { ILogger } from '../lib/ILogger'

export interface ICheckValidator {
  validate (receivedCheckData: Array<object>, validateCheckMessage: ValidateCheckMessageV1, logger: ILogger): void
}

export class CheckValidatorV1 implements ICheckValidator {
  private _tableService: IAsyncTableService
  constructor(tableService?: IAsyncTableService) {
    if (tableService !== undefined) {
      this._tableService = tableService
    } else {
      this._tableService = new AsyncTableService()
    }
  }

  async validate (receivedCheckData: Array<object>, validateCheckMessage: ValidateCheckMessageV1, logger: ILogger): Promise<void> {
    // this should fail outside of the catch as we wont be able to update the entity
    // without a reference to it and should rightly go on the dead letter queue
    const receivedCheck = this.findReceivedCheck(receivedCheckData)
    try {
      // all failures must be caught and recorded against the entity
    } catch (error) {
      // TODO update receivedCheck with validation errors
    }
  }

  private findReceivedCheck (receivedCheckRef: Array<object>) {
    if (receivedCheckRef.length === 0) {
      throw new Error('received check data is empty')
    }
    return receivedCheckRef[0]
  }

  private detectArchive (message: object) {
    if (!message.hasOwnProperty('archive')) {
      throw new Error(`message is missing 'archive' property`)
    }
  }
}
