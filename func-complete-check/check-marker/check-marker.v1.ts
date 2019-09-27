import * as RA from 'ramda-adjunct'
import * as R from 'ramda'
import { IAsyncTableService, AsyncTableService } from '../lib/storage-helper'
import { ValidatedCheck } from '../typings/message-schemas'
import moment = require('moment')
import { ICheckFormService, CheckFormService } from '../lib/check-form.service'

export interface ICheckMarkerFunctionBindings {
  receivedCheckTable: Array<any>
  checkNotificationQueue: Array<any>
}

export class CheckMarkerV1 {

  private _tableService: IAsyncTableService
  private _sqlService: ICheckFormService

  constructor (tableService?: IAsyncTableService, sqlService?: ICheckFormService) {
    if (tableService === undefined) {
      this._tableService = new AsyncTableService()
    } else {
      this._tableService = tableService
    }

    if (sqlService === undefined) {
      this._sqlService = new CheckFormService()
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
    const rawCheckForm = await this._sqlService.getCheckFormDataByCheckCode(checkCode)

    if (R.isNil(rawCheckForm)) {
      await this.updateReceivedCheckWithMarkingError(receivedCheck, 'associated checkForm could not be found by checkCode')
      return
    }

    let checkForm: any

    try {
      checkForm = JSON.parse(rawCheckForm)
    } catch (error) {
      await this.updateReceivedCheckWithMarkingError(receivedCheck, 'associated checkForm data is not valid JSON')
      return
    }

    if (!RA.isArray(checkForm) || RA.isEmptyArray(checkForm)) {
      await this.updateReceivedCheckWithMarkingError(receivedCheck, 'check form data is either empty or not an array')
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
