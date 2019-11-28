import { Moment } from 'moment'
import { IPupilLoginDataService, PupilLoginDataService } from './pupil-login.data.service'

export interface IPupilLoginMessage {
  version: number
  checkCode: string
  loginAt: Moment
}

export class PupilLoginService {
  private dataService: IPupilLoginDataService

  constructor (dataService?: IPupilLoginDataService) {
    if (dataService === undefined) {
      dataService = new PupilLoginDataService()
    }
    this.dataService = dataService
  }

  async process (message: IPupilLoginMessage) {
    if (message.version !== 1) {
      throw new Error(`pupil-login message version:${message.version} unsupported`)
    }
    return this.dataService.updateCheckWithLoginTimestamp(message.checkCode, message.loginAt)
  }
}
