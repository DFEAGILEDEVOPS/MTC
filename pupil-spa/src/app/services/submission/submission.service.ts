import { APP_CONFIG } from '../config/config.service'
import { HttpHeaders } from '@angular/common/http'
import { HttpService } from '../http/http.service'
import { Injectable } from '@angular/core'

@Injectable()
export class SubmissionService {

  constructor(private http: HttpService) {}

  async submit(payload: any): Promise<any> {
    const submissionUrl = payload.tokens.checkSubmission.url
    const jwtToken = payload.tokens.checkSubmission.token
    payload.version = 3
    console.dir(payload)
    await this.http.post(submissionUrl, payload,
      new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${jwtToken}`),
      APP_CONFIG.checkSubmissionAPIErrorMaxAttempts)
  }
}
