import { CheckSubmitDataService } from './check-submit.data.service'

export class CheckSubmitService {
  public static async submitV3CheckPayload (rawJsonPayload?: string, parseAsJson: boolean): Promise<any> {
    if (rawJsonPayload === undefined) rawJsonPayload = ''
    const json = JSON.parse(rawJsonPayload)
    return CheckSubmitDataService.submitCheckMessageV3(json)
  }
}
