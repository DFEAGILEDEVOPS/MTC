import { CheckSubmitDataService } from './check-submit.data.service'

export class CheckSubmitService {
  public static async submitV3CheckPayload (parseAsJson: boolean, payload?: string): Promise<any> {
    let parsedPayload: string | Record<string, any> = ''
    if (parseAsJson) {
      if (payload === undefined || payload === '') {
        payload = '{}'
      }
      parsedPayload = JSON.parse(payload)
    } else {
      parsedPayload = payload ?? ''
    }
    return CheckSubmitDataService.submitCheckMessageV3(parsedPayload)
  }
}
