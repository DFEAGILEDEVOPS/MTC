import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';
import { AzureQueueService } from '../azure-queue/azure-queue.service';

@Injectable()
export class FeedbackService {
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

  async postFeedback() {
    const storedFeedback = this.storageService.getItem('feedback');
    const accessToken = this.storageService.getItem('access_token');
    if (!storedFeedback || !accessToken) {
      return false;
    }
    const inputType = storedFeedback.inputType.value;
    const satisfactionRating = storedFeedback.satisfactionRating.value;
    const comments = storedFeedback.comments;
    const checkCode = storedFeedback.checkCode;

    const payload = {
      version: 2,
      inputType,
      satisfactionRating,
      comments,
      checkCode,
      accessToken
    };
    await this.queueSubmit(payload);
  }

  /**
   * HPA pupil feedback submission
   * @param {Object} payload
   * @returns {Promise.<void>}
   */
  async queueSubmit(payload) {
    const { url, token, queueName } = this.tokenService.getToken('pupilFeedback');
    // Create a model for the payload
    const retryConfig = {
      errorDelay: this.feedbackAPIErrorDelay,
      errorMaxAttempts: this.feedbackAPIErrorMaxAttempts
    };
    await this.azureQueueService.addMessage(queueName, url, token, payload, retryConfig);
  }
}
