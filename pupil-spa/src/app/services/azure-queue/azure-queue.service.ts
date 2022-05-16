import { Injectable } from '@angular/core';
import { TextBase64QueueMessageEncoder } from './textBase64QueueMessageEncoder';
import { APP_CONFIG } from '../config/config.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AzureQueueService {

  constructor(private http: HttpClient) {
  }


  /**
   * Create a text base64 queue message encoder
   * @returns {Object}
   */
  public getTextBase64QueueMessageEncoder (): TextBase64QueueMessageEncoder {
    return new TextBase64QueueMessageEncoder(this.queueStorage.QueueMessageEncoder);
  }

  /**
   * Add message to the queue
   * @param {String} queueName
   * @param {String} url
   * @param {String} token
   * @param {Object} payload
   * @param {Object} retryConfig
   * @returns {Promise.<Object>}
   */
  public async addMessageToQueue (queueName: string, storageAccountUrl: string, sasTokenQueryString: string, payload: object, retryConfig: object): Promise<Object> {
    // to increase message expiry add this object as 3rd param to createMessage call
    // const twentyEightDaysInSeconds = 2419200
    // const options = {
    //   messageTimeToLive: twentyEightDaysInSeconds
    // }
    const queueEndpointUrl = `${storageAccountUrl}/${queueName}messages?messagettl=-1&${sasTokenQueryString}`
    const encoder = this.getTextBase64QueueMessageEncoder();
    const message = JSON.stringify(payload);
    const encodedMessage = encoder.encode(message);
    // set TTL to -1
    // base64 encode
    // allow retries (linear and expo?)
    const headers = { 'x-ms-date': 'TODO current date time ISO format' };
    await this.http.post(queueEndpointUrl, encodedMessage, {
      headers: headers
    })

      const fallbackUrl = `${window.location.origin}/queue`;
      const fallbackQueueService = this.initQueueService(queueName, fallbackUrl, token, retryConfig);
      return fallbackQueueService.createMessage(queueName, encodedMessage);
    });
  }
}
