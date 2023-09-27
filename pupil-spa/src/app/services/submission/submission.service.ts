import { APP_CONFIG } from '../config/config.service'
import { HttpHeaders } from '@angular/common/http'
import { HttpService } from '../http/http.service'
import { Injectable } from '@angular/core'

@Injectable()
export class SubmissionService {

  constructor(private http: HttpService) {}

  async submit(compressedPayload: any, submissionUrl: string, jwtToken: string): Promise<any> {
    await this.http.post(submissionUrl, compressedPayload,
      new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${jwtToken}`),
      APP_CONFIG.checkSubmissionAPIErrorMaxAttempts)
  }
}
