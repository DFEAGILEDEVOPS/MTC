import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { TokenService } from '../token/token.service'
import { APP_CONFIG } from '../config/config.service'
import { Observable } from 'rxjs'

export interface QueueMessageRetryConfig {
  DelayBetweenErrors: number
  MaxAttempts: number
  SubmitPendingViewMinDisplayTime?: number
}

@Injectable()
export class AzureQueueService {

  constructor(private http: HttpClient) {}

  /**
   * Add message to the queue
   * @param {String} queueName
   * @param {String} storageAccountUrl
   * @param {String} sasToken
   * @param {Object} payload
   * @param {Object} retryConfig
   * @returns {Promise.<Object>}
   */
  public async addMessageToQueue (queueName: string, storageAccountUrl: string, sasToken: string, payload: object, retryConfig: QueueMessageRetryConfig): Promise<Observable<Object>> {
    // to increase message expiry add this object as 3rd param to createMessage call
    // const twentyEightDaysInSeconds = 2419200
    // const options = {
    //   messageTimeToLive: twentyEightDaysInSeconds
    // }
    const queueEndpointUrl = `${storageAccountUrl}/${queueName}messages?messagettl=-1&${sasToken}`
    const message = JSON.stringify(payload)
    // encode to base64
    const encodedMessage = btoa(message)
    const wrappedXmlMessage = `<?xml version="1.0" encoding="utf-8"?><QueueMessage><MessageText>${encodedMessage}</MessageText></QueueMessage>`
    // TODO allow linear retries via config
    const headers = {
      'x-ms-date': (new Date()).toISOString(),
      'Content-Type': `application/atom+xml;charset="utf-8"`
    }
    return this.http.post(queueEndpointUrl, wrappedXmlMessage, {
      headers: headers
    })

    //TODO fallback queue
/*     const fallbackUrl = `${window.location.origin}/queue`
    const fallbackQueueService = this.initQueueService(this.queueName, fallbackUrl, this.sasTokenQueryString, this.retryConfig)
    return fallbackQueueService.createMessage(this.queueName, encodedMessage) */
  }
}
