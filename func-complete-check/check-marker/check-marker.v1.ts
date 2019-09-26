import * as RA from 'ramda-adjunct'
import { IAsyncTableService } from '../lib/storage-helper'
import { AsyncTableService } from '../lib/azure-storage-helper'
import { ValidatedCheck } from '../typings/message-schemas'
import moment = require('moment')

export interface ICheckMarkerFunctionBindings {
  receivedCheckTable: Array<any>
  checkNotificationQueue: Array<any>
}

export class CheckMarkerV1 {

  private _tableService: IAsyncTableService

  constructor (tableService?: IAsyncTableService) {
    if (tableService === undefined) {
      this._tableService = new AsyncTableService()
    } else {
      this._tableService = tableService
    }
  }

  async mark (functionBindings: ICheckMarkerFunctionBindings): Promise<void> {
    // this should fail outside of the catch as we wont be able to update the entity
    // without a reference to it and should rightly go on the dead letter queue
    const receivedCheck = this.findReceivedCheck(functionBindings.receivedCheckTable)
    if (RA.isEmptyString(receivedCheck.answers)) {
      receivedCheck.markError = 'answers property not populated'
      receivedCheck.markedAt = moment().toDate()
      await this._tableService.replaceEntityAsync('receivedCheck', receivedCheck)
    }
  }

  private findReceivedCheck (receivedCheckRef: Array<any>): ValidatedCheck {
    if (RA.isEmptyArray(receivedCheckRef)) {
      throw new Error('received check reference is empty')
    }
    return receivedCheckRef[0]
  }
}
