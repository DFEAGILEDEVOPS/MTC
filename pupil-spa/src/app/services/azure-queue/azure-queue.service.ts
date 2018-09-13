import * as bluebird from 'bluebird';
import { Inject, Injectable } from '@angular/core';
import { TokenService } from '../token/token.service';
import {
  IQueueStorage,
  IQueueService,
  QUEUE_STORAGE_TOKEN,
  ITextBase64QueueMessageEncoder,
} from './azureStorage';
import { TextBase64QueueMessageEncoder } from './textBase64QueueMessageEncoder';

/**
 * Declaration of azure queue service
 */

declare let AzureStorage;

@Injectable()
export class AzureQueueService {
  private serviceInstance: IQueueService;
  private encoder: ITextBase64QueueMessageEncoder;

  constructor(private tokenService: TokenService,
              @Inject(QUEUE_STORAGE_TOKEN) private queueStorage: IQueueStorage) {
  }

  /**
   * Create a queue service and promisify library calls
   * @param {String} queueName
   * @param {String} url
   * @param {String} token
   * @returns {Promise}
   */
  private initQueueService(queueName: string, url: string, token: string): IQueueService {
    const service =  this.queueStorage
      .createQueueServiceWithSas(url.replace(queueName, ''), token)
      .withFilter(new this.queueStorage.ExponentialRetryPolicyFilter());
    service.performRequest = bluebird.promisify(service.performRequest, service);
    service.createMessage = bluebird.promisify(service.createMessage, service);
    return service;
  }

  /**
   * Add message to the queue
   * @param {String} queueName
   * @param {String} url
   * @param {String} token
   * @param {Object} payload
   * @returns {Promise.<Object>}
   */
  public async addMessage(queueName: string, url: string, token: string, payload: object): Promise<Object> {
    if (!this.serviceInstance) {
      this.serviceInstance = this.initQueueService(queueName, url, token);
    }
    if (!this.encoder) {
      this.encoder = new TextBase64QueueMessageEncoder(this.queueStorage.QueueMessageEncoder);
    }
    const message = JSON.stringify(payload);
    const encodedMessage = this.encoder.encode(message);
    return this.serviceInstance.createMessage(queueName, encodedMessage);
  }
}
