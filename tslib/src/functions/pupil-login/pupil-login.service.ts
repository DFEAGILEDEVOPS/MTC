import { Moment } from 'moment'
import { IPupilLoginDataService, PupilLoginDataService } from './pupil-login.data.service'
import { v4 as uuid } from 'uuid'
import moment = require('moment')
export interface IPupilLoginMessage {
  version: number
  checkCode: string
  loginAt: Moment
}

export interface IPupilLoginFunctionBindings {
  pupilEventTable: Array<any>
}

export interface IPupilEvent {
  PartitionKey: string
  RowKey: string
  eventType: string
  payload: any
  processedAt: Date
}

export class PupilLoginService {
  private dataService: IPupilLoginDataService

  constructor (dataService?: IPupilLoginDataService) {
    if (dataService === undefined) {
      dataService = new PupilLoginDataService()
    }
    this.dataService = dataService
  }

  async process (message: IPupilLoginMessage, bindings: IPupilLoginFunctionBindings) {
    if (message.version !== 1) {
      throw new Error(`pupil-login message version:${message.version} unsupported`)
    }
    bindings.pupilEventTable = []
    bindings.pupilEventTable.push({
      PartitionKey: message.checkCode,
      RowKey: uuid(),
      eventType: 'pupil-login',
      payload: message,
      processedAt: moment().toDate()
    })
    return this.dataService.updateCheckWithLoginTimestamp(message.checkCode, message.loginAt)
  }
}
