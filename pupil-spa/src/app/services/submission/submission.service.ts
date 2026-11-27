import { APP_CONFIG } from '../config/config.service'
import { HttpHeaders } from '@angular/common/http'
import { HttpService } from '../http/http.service'
import { Injectable } from '@angular/core'
import { CompressorService } from '../compressor/compressor.service'
import { ApplicationInsightsService } from '../app-insights/app-insights.service'

@Injectable()
export class SubmissionService {
  public static readonly SubmittedCheckVersion4 = 4
  constructor(private http: HttpService, private appInsightsService: ApplicationInsightsService) {}

  async submit(payload: any): Promise<any> {
    const jsonPayload = JSON.stringify(payload)
    const submissionUrl = payload.tokens.checkSubmission.url
    this.appInsightsService.trackTrace(`Check [${payload?.checkCode}] for school [${payload?.school?.uuid}] raw size ${jsonPayload.length}`)
    const jwtToken = payload.tokens.checkSubmission.token
    // Compressing to gzip gives us a smaller payload to transmit across the network, as well as a better payload sizes for huge payloads.
    const gzipArchive = CompressorService.compressToGzip(jsonPayload)
    const postBody = {
      archive: gzipArchive,
      version: SubmissionService.SubmittedCheckVersion4,
      checkCode: payload.checkCode,
      schoolUUID: payload.school.uuid
    }
    this.appInsightsService.trackTrace(`Check [${payload?.checkCode}] for school [${payload?.school?.uuid}] final payload length: ${gzipArchive.length}`)
    await this.http.post(submissionUrl, postBody,
      new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${jwtToken}`),
      APP_CONFIG.checkSubmissionAPIErrorMaxAttempts)
  }
}
