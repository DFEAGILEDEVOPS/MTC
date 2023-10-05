import { CheckSubmitDataService } from './check-submit.data.service'

export class CheckSubmitService {
  public static async submitV3CheckPayload (rawJsonPayload?: string): Promise<any> {
    if (rawJsonPayload === undefined) rawJsonPayload = ''
    return CheckSubmitDataService.submitCheckMessageV3(rawJsonPayload)
  }
}
