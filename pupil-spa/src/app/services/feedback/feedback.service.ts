import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';
import { HttpService } from '../http/http.service'
import { HttpHeaders } from '@angular/common/http'

export interface IFeedbackService {
  postFeedback(): Promise<boolean>;
  submitFeedback(payload: any): Promise<void>;
}

export interface IPupilFeedbackMessage {
  version: number
  checkCode?: string
  feedback?: string
}

@Injectable()
export class FeedbackService implements IFeedbackService {
  feedbackAPIErrorDelay;
  feedbackAPIErrorMaxAttempts;

  constructor(private storageService: StorageService,
              private tokenService: TokenService,
              private httpService: HttpService) {
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
    const feedback = storedFeedback.satisfactionRating.value;
    const checkCode = storedFeedback.checkCode;

    const payload: IPupilFeedbackMessage = {
      version: 2,
      feedback: feedback,
      checkCode
    };
    await this.submitFeedback(payload);
    return true;
  }

  /**
   * HPA pupil feedback submission
   * @param {Object} payload
   * @returns {Promise.<void>}
   */
  async submitFeedback(payload: any) {
    const { url, token } = this.tokenService.getToken('pupilFeedback');
    // Create a model for the payload
    const postBody: IPupilFeedbackMessage = {
      version: 3,
      feedback: payload.feedback,
      checkCode: payload.checkCode
    }
    await this.httpService.post(url, postBody,
          new HttpHeaders()
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${token}`),
          APP_CONFIG.checkSubmissionAPIErrorMaxAttempts)
  }
}
