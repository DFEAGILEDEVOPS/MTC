import * as bluebird from 'bluebird';
import { WindowRefService } from '../window-ref/window-ref.service';
import { Injectable } from '@angular/core';
import { TokenService } from '../token/token.service';

/**
 * Declaration of azure queue service
 */
@Injectable()
export class AzureQueueService {
  private window;
  private queueService;

  constructor(private tokenService: TokenService,
              private windowRefService: WindowRefService) {
    this.window = windowRefService.nativeWindow;
  }

  /**
   * Initialise queue service for messaging
   * @param {String} queue
   * @param {String} tokenKey
   * @returns {Promise}
   */
  private initQueueService(queue, tokenKey): void {
    const token = this.tokenService.getToken(tokenKey);
    if (!this.queueService) {
      this.queueService = this.window.AzureStorage.Queue
        .createQueueServiceWithSas(token.url.replace(queue, ''), token.token)
        .withFilter(new this.window.AzureStorage.Queue.ExponentialRetryPolicyFilter()
        );
    }
  }

  /**
   * Setup promisified queue service methods required for message creation
   * @returns {Promise}
   */
  private initQueueMessaging(): void {
      this.queueService.performRequest = bluebird.promisify(this.queueService.performRequest, this.queueService);
      this.queueService.createMessage = bluebird.promisify(this.queueService.createMessage, this.queueService);
  }

  /**
   * Add message to the queue
   * @param {String} queue
   * @param {String} tokenKey
   * @param {Object} payload
   * @returns {Promise.<void>}
   */
  public async addMessage(queue, tokenKey, payload): Promise<void> {
    this.initQueueService(queue, tokenKey);
    this.initQueueMessaging();
    const message = JSON.stringify(payload);
    const encoder = new this.window.AzureStorage.Queue.QueueMessageEncoder.BinaryBase64QueueMessageEncoder();
    const encodedMessage = encoder.encode(message);
    await this.queueService.createMessage(queue, encodedMessage);
  }
}
