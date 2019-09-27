import * as RA from 'ramda-adjunct'
import { IAsyncTableService } from '../lib/storage-helper'
import { AsyncTableService } from '../lib/azure-storage-helper'
import { ValidatedCheck } from '../typings/message-schemas'
import moment = require('moment')
import { ISqlService, SqlService } from '../lib/sql'

export interface ICheckMarkerFunctionBindings {
  receivedCheckTable: Array<any>
  checkNotificationQueue: Array<any>
}

export class CheckMarkerV1 {

  private _tableService: IAsyncTableService
  private _sqlService: ISqlService

  constructor (tableService?: IAsyncTableService, sqlService?: ISqlService) {
    if (tableService === undefined) {
      this._tableService = new AsyncTableService()
    } else {
      this._tableService = tableService
    }

    if (sqlService === undefined) {
      this._sqlService = new SqlService()
    } else {
      this._sqlService = sqlService
    }
  }

  async mark (functionBindings: ICheckMarkerFunctionBindings): Promise<void> {

    const receivedCheck = this.findReceivedCheck(functionBindings.receivedCheckTable)
    if (RA.isEmptyString(receivedCheck.answers)) {
      await this.updateReceivedCheckWithMarkingError(receivedCheck, 'answers property not populated')
      return
    }

    let parsedAnswersJson: any
    try {
      parsedAnswersJson = JSON.parse(receivedCheck.answers)
    } catch (error) {
      await this.updateReceivedCheckWithMarkingError(receivedCheck, 'answers data is not valid JSON')
      return
    }

    if (!RA.isArray(parsedAnswersJson)) {
      await this.updateReceivedCheckWithMarkingError(receivedCheck, 'answers data is not an array')
      return
    }

    const checkCode = receivedCheck.RowKey
    const checkForm = await this._sqlService.getCheckFormDataByCheckCode(checkCode)

    if (!RA.isArray(checkForm) || RA.isEmptyArray(checkForm)) {
      await this.updateReceivedCheckWithMarkingError(receivedCheck, 'associated checkForm could not be found by checkCode')
      return
    }
  }

  private findReceivedCheck (receivedCheckRef: Array<any>): ValidatedCheck {
    if (RA.isEmptyArray(receivedCheckRef)) {
      throw new Error('received check reference is empty')
    }
    return receivedCheckRef[0]
  }

  private async updateReceivedCheckWithMarkingError (receivedCheck: ValidatedCheck, markingError: string) {
    receivedCheck.markError = markingError
    receivedCheck.markedAt = moment().toDate()
    return this._tableService.replaceEntityAsync('receivedCheck', receivedCheck)
  }
}
