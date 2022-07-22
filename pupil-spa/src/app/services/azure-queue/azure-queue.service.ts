import { Injectable } from '@angular/core'
import { HttpHeaders } from '@angular/common/http'
import { Buffer } from 'buffer'
import { HttpService } from '../http/http.service'
import { APP_CONFIG } from '../config/config.service';

export interface QueueMessageRetryConfig {
  DelayBetweenRetries: number
  MaxAttempts: number
  SubmitPendingViewMinDisplayTime?: number
}

export interface IAzureQueueService {
  addMessageToQueue (
                    storageAccountUrl: string,
                    sasToken: string,
                    payload: object,
                    retryConfig: QueueMessageRetryConfig): Promise<void>
}

@Injectable()
export class AzureQueueService implements IAzureQueueService {

  constructor(private http: HttpService) {}

  /**
   * Add message to the queue
   * @param {String} storageAccountUrl
   * @param {String} sasToken
   * @param {Object} payload
   * @param {Object} retryConfig
   * @returns {Promise.<Object>}
   */
  public async addMessageToQueue (
                    storageAccountUrl: string,
                    sasToken: string,
                    payload: object,
                    retryConfig: QueueMessageRetryConfig,
                    messageLifeTimeInSeconds: number = -1): Promise<void> {
    const queueEndpointUrl = `${storageAccountUrl}/messages?messagettl=${messageLifeTimeInSeconds}&${sasToken}`
    const message = JSON.stringify(payload)
    const encodedMessage = Buffer.from(message, 'utf8').toString('base64')
    const wrappedXmlMessage = `<?xml version="1.0" encoding="utf-8"?><QueueMessage><MessageText>${encodedMessage}</MessageText></QueueMessage>`
    // TODO allow linear retries via config
    // TODO pin version of API to use via config setting???
/*     const headers1 = new HttpHeaders ({
      'Accept': 'application/xml',
      'Content-Type': 'application/xml',
      'x-ms-date': (new Date()).toISOString()
    }) */

    const headers = new HttpHeaders()
        .set('Content-Type', 'text/xml')
        .append('Accept', 'application/xml, text/xml')
        .append('x-ms-date', (new Date()).toISOString())

    try {
      await this.http.postXml(queueEndpointUrl, wrappedXmlMessage, headers, retryConfig.MaxAttempts)
    } catch (error) {
      if (!APP_CONFIG.production) {
        throw error;
      } else {
        const fallbackUrl = `${window.location.origin}/queue?messagettl=-1&${sasToken}`
        await this.http.post(fallbackUrl, wrappedXmlMessage, headers)
      }
    }
  }
}
