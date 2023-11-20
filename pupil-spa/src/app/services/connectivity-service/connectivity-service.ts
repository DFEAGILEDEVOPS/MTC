import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { first } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

import { APP_CONFIG } from '../config/config.service';
import { AzureQueueService, QueueMessageRetryConfig } from '../azure-queue/azure-queue.service';

import { default as connectivityErrorMessages } from './connectivity-error-messages';

@Injectable()
export class ConnectivityService {

  testPupilConnectionQueueName;
  testPupilConnectionQueueUrl;
  testPupilConnectionQueueToken;
  testPupilConnectionDelay;
  testPupilConnectionMaxAttempts;

  private connectivityMessageSource = new BehaviorSubject('');
  public currentConnectivityMessageSource = this.connectivityMessageSource.asObservable();
  public errorMessages = new Array<string>();

  constructor(
    private azureQueueService: AzureQueueService,
    private http: HttpClient,
    ) {
    const {
      testPupilConnectionQueueName,
      testPupilConnectionQueueUrl,
      testPupilConnectionQueueToken,
      testPupilConnectionDelay,
      testPupilConnectionMaxAttempts
    } = APP_CONFIG;
    this.testPupilConnectionQueueName = testPupilConnectionQueueName;
    this.testPupilConnectionQueueUrl = testPupilConnectionQueueUrl;
    this.testPupilConnectionQueueToken = testPupilConnectionQueueToken;
    this.testPupilConnectionDelay = testPupilConnectionDelay;
    this.testPupilConnectionMaxAttempts = testPupilConnectionMaxAttempts;
  }

  async connectivityCheckSucceeded() {
    let responses;
    try {
      responses = await Promise.all([this.canAccessPupilAuthURL(), this.canAccessAzureStorageQueue()]);
    } catch (error) {
      return false;
    }
    if (this.errorMessages.length > 0) {
      this.generateConnectivityErrorMessage();
    }
    return responses.every(v => !!v);
  }

  async canAccessPupilAuthURL() {
    return new Promise(async (resolve) => {
      await this.http.get(`${APP_CONFIG.apiBaseUrl}/ping`, { observe: 'response' })
        .pipe(first())
        .toPromise()
        .then(data => {
          return resolve(true);
        })
        .catch(() => {
          this.errorMessages.push(connectivityErrorMessages.pupilAuthError);
          return resolve(false);
        });
    });
  }

  async canAccessAzureStorageQueue() {
    const retryConfig: QueueMessageRetryConfig = {
      DelayBetweenRetries: this.testPupilConnectionDelay,
      MaxAttempts: this.testPupilConnectionMaxAttempts
    };
    try {
      await this.azureQueueService.addMessageToQueue(
        this.testPupilConnectionQueueUrl,
        this.testPupilConnectionQueueToken,
        {},
        retryConfig,
        60);
    } catch (err) {
      this.errorMessages.push(connectivityErrorMessages.testQueueError);
      return false;
    }
    return true;
  }

  generateConnectivityErrorMessage() {
    const message = this.errorMessages.length === 1
      ? this.errorMessages[0]
      : connectivityErrorMessages.combinedError;
    this.connectivityMessageSource.next(message);
  }
}
