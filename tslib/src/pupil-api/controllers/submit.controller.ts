import { CheckSubmitService } from '../services/check-submit.service'

export class SubmitController {
  private readonly checkSubmitService: ICheckSubmitService

  constructor (checkSubmitService?: ICheckSubmitService) {
    if (checkSubmitService === undefined) {
      checkSubmitService = new CheckSubmitService()
    }
    this.checkSubmitService = checkSubmitService
  }

  async postSubmit (data: any): Promise<any> {
    throw new Error('Not implemented')
  }
}
