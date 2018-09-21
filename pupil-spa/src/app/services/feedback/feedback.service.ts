import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';
import { Http, RequestOptions, Headers } from '@angular/http';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';
import { AzureQueueService } from '../azure-queue/azure-queue.service';
import { queueNames } from '../azure-queue/queue-names';

@Injectable()
export class FeedbackService {
  featureUseHpa;
  feedbackAPIErrorDelay;
  feedbackAPIErrorMaxAttempts;

  constructor(private http: Http,
              private storageService: StorageService,
              private tokenService: TokenService,
              private azureQueueService: AzureQueueService) {
    const { featureUseHpa,
      feedbackAPIErrorDelay,
      feedbackAPIErrorMaxAttempts
    } = APP_CONFIG;
    this.featureUseHpa = featureUseHpa;
    this.feedbackAPIErrorDelay = feedbackAPIErrorDelay;
    this.feedbackAPIErrorMaxAttempts = feedbackAPIErrorMaxAttempts;
  }

  async postFeedback() {
    const storedFeedback = this.storageService.getItem('feedback');
    const accessToken = this.storageService.getItem('access_token');
    if (!storedFeedback || !accessToken) {
      return false;
    }
    const inputType = storedFeedback.inputType.id;
    const satisfactionRating = storedFeedback.satisfactionRating.id;
    const comments = storedFeedback.comments;
    const checkCode = storedFeedback.checkCode;

    const payload = {
      inputType,
      satisfactionRating,
      comments,
      checkCode,
      accessToken
    };
    if (this.featureUseHpa === true) {
      await this.queueSubmit(payload);
    } else {
      await this.postPupilFeedback(payload);
    }
  }

  /**
   * HPA pupil feedback submission
   * @param {Object} payload
   * @returns {Promise.<void>}
   */
  async queueSubmit(payload) {
    const queueName = queueNames.pupilFeedback;
    const { url, token } = this.tokenService.getToken('pupilFeedback');
    // Create a model for the payload
    const retryConfig = {
      errorDelay: this.feedbackAPIErrorDelay,
      errorMaxAttempts: this.feedbackAPIErrorMaxAttempts
    };
    await this.azureQueueService.addMessage(queueName, url, token, payload, retryConfig);
  }

  /**
   * Non HPA pupil feedback submission
   * @param {Object} payload
   * @returns {Promise.<void>}
   */
  async postPupilFeedback(payload) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const requestArgs = new RequestOptions({ headers: headers });
    await this.http.post(`${APP_CONFIG.apiURL}/api/pupil-feedback`,
      payload,
      requestArgs)
      .toPromise()
      .then((response) => {
        if (response.status !== 201) {
          return new Error('Feedback Error:' + response.status + ':' + response.statusText);
        }
      }).catch(error => new Error(error));
  }
}
