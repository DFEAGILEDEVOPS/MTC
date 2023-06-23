import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';
import { AzureQueueService, QueueMessageRetryConfig } from '../azure-queue/azure-queue.service';

export interface IFeedbackService {
  postFeedback(): Promise<boolean>;
  queueSubmit(payload: any): Promise<void>;
}

@Injectable()
export class FeedbackService implements IFeedbackService {
  feedbackAPIErrorDelay;
  feedbackAPIErrorMaxAttempts;

  constructor(private storageService: StorageService,
              private tokenService: TokenService,
              private azureQueueService: AzureQueueService) {
    const {
      feedbackAPIErrorDelay,
      feedbackAPIErrorMaxAttempts
    } = APP_CONFIG;
    this.feedbackAPIErrorDelay = feedbackAPIErrorDelay;
    this.feedbackAPIErrorMaxAttempts = feedbackAPIErrorMaxAttempts;
  }

  async postFeedback(): Promise<boolean> {
    const storedFeedback = this.storageService.getFeedback();
    if (!storedFeedback) {
      return false;
    }
    const satisfactionRating = storedFeedback.satisfactionRating.value;
    const checkCode = storedFeedback.checkCode;

    const payload = {
      version: 2,
      satisfactionRating,
      checkCode
    };
    await this.queueSubmit(payload);
    return true;
  }

  /**
   * HPA pupil feedback submission
   * @param {Object} payload
   * @returns {Promise.<void>}
   */
  async queueSubmit(payload: any) {
    const { url, token } = this.tokenService.getToken('pupilFeedback');
    // Create a model for the payload
    const retryConfig: QueueMessageRetryConfig = {
      DelayBetweenRetries: this.feedbackAPIErrorDelay,
      MaxAttempts: this.feedbackAPIErrorMaxAttempts
    };
    await this.azureQueueService.addMessageToQueue(url, token, payload, retryConfig);
  }
}
