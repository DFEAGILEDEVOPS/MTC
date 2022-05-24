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
  addMessageToQueue (queueName: string, storageAccountUrl: string, sasToken: string,
    payload: object, retryConfig: QueueMessageRetryConfig): Promise<void>
}

@Injectable()
export class AzureQueueService implements IAzureQueueService {

  constructor(private http: HttpService) {}

  /**
   * Add message to the queue
   * @param {String} queueName
   * @param {String} storageAccountUrl
   * @param {String} sasToken
   * @param {Object} payload
   * @param {Object} retryConfig
   * @returns {Promise.<Object>}
   */
  public async addMessageToQueue (queueName: string, storageAccountUrl: string, sasToken: string,
    payload: object, retryConfig: QueueMessageRetryConfig): Promise<void> {
    const queueEndpointUrl = `${storageAccountUrl}/messages?messagettl=-1&${sasToken}`
    const message = JSON.stringify(payload)
    const encodedMessage = Buffer.from(message, 'utf8').toString('base64')
    const wrappedXmlMessage = `<?xml version="1.0" encoding="utf-8"?><QueueMessage><MessageText>${encodedMessage}</MessageText></QueueMessage>`
    // TODO allow linear retries via config
    const headers = new HttpHeaders ({
      'x-ms-date': (new Date()).toISOString(),
      'Content-Type': `application/atom+xml;charset="utf-8"`
    })

    try {
      await this.http.post(queueEndpointUrl, wrappedXmlMessage, headers)
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
