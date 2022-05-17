import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Buffer } from 'buffer'

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
  public async addMessageToQueue (queueName: string, storageAccountUrl: string, sasToken: string, payload: object, retryConfig: QueueMessageRetryConfig): Promise<void> {
    const queueEndpointUrl = `${storageAccountUrl}/messages?messagettl=-1&${sasToken}`
    const message = JSON.stringify(payload)
    const encodedMessage = Buffer.from(message, 'utf8').toString('base64')
    const wrappedXmlMessage = `<?xml version="1.0" encoding="utf-8"?><QueueMessage><MessageText>${encodedMessage}</MessageText></QueueMessage>`
    // TODO allow linear retries via config
    const headers = {
      'x-ms-date': (new Date()).toISOString(),
      'Content-Type': `application/atom+xml;charset="utf-8"`
    }
    try {
      console.log(`GUY: posting message to ${queueEndpointUrl}`)
      console.log(`GUY: message body ${wrappedXmlMessage}`)
      await this.http.post(queueEndpointUrl, wrappedXmlMessage, {
        headers: headers
      })
    } catch (error) {
      console.log(`GUY: error posting... ${error.toString()}`)
      throw error
    }

    //TODO fallback queue
/*     const fallbackUrl = `${window.location.origin}/queue`
    const fallbackQueueService = this.initQueueService(this.queueName, fallbackUrl, this.sasTokenQueryString, this.retryConfig)
    return fallbackQueueService.createMessage(this.queueName, encodedMessage) */
  }
}
