import { type IPupilLoginDataService, PupilLoginDataService } from './pupil-login.data.service'
import { v4 as uuid } from 'uuid'
import moment = require('moment')
import { type IModifyResult } from '../../sql/sql.service'
export interface IPupilLoginMessage {
  version: number
  checkCode: string
  loginAt: Date
  practice: boolean
}

export interface IPupilLoginFunctionBindings {
  pupilEventTable: any[]
}

export interface IPupilEvent {
  PartitionKey: string
  RowKey: string
  eventType: string
  payload: any
  processedAt: Date
}

export class PupilLoginService {
  private readonly dataService: IPupilLoginDataService

  constructor (dataService?: IPupilLoginDataService) {
    if (dataService === undefined) {
      dataService = new PupilLoginDataService()
    }
    this.dataService = dataService
  }

  async process (message: IPupilLoginMessage, bindings: IPupilLoginFunctionBindings): Promise<IModifyResult> {
    if (message.version !== 1) {
      throw new Error(`pupil-login message version:${message.version} unsupported`)
    }
    bindings.pupilEventTable = []
    bindings.pupilEventTable.push({
      PartitionKey: message.checkCode.toLowerCase(),
      RowKey: uuid(),
      eventType: 'pupil-login',
      payload: message,
      processedAt: moment().toDate()
    })
    const loginDate = new Date(message.loginAt)
    return this.dataService.updateCheckWithLoginTimestamp(message.checkCode, loginDate)
  }
}
