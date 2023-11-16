import { APP_CONFIG } from '../config/config.service'
import { HttpHeaders } from '@angular/common/http'
import { HttpService } from '../http/http.service'
import { Injectable } from '@angular/core'
import { CompressorService } from '../compressor/compressor.service'

@Injectable()
export class SubmissionService {

  public static readonly SubmittedCheckVersion3 = 3
  constructor(private http: HttpService) {}

  async submit(payload: any): Promise<any> {
    const submissionUrl = payload.tokens.checkSubmission.url
    const jwtToken = payload.tokens.checkSubmission.token
    const postBody = {
      archive: CompressorService.compressToBase64(JSON.stringify(payload)),
      version: SubmissionService.SubmittedCheckVersion3,
      checkCode: payload.checkCode,
      schoolUUID: payload.school.uuid
    }
    await this.http.post(submissionUrl, postBody,
      new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${jwtToken}`),
      APP_CONFIG.checkSubmissionAPIErrorMaxAttempts)
  }
}
