import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { first } from 'rxjs/operators';

import { APP_CONFIG } from '../config/config.service';
import { AzureQueueService } from '../azure-queue/azure-queue.service';

@Injectable()
export class ConnectivityService {

  testPupilConnectionQueueName;
  testPupilConnectionQueueUrl;
  testPupilConnectionQueueToken;
  testPupilConnectionDelay;
  testPupilConnectionMaxAttempts;

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
    const responses = await Promise.all([this.canAccessPupilAuthURL(), this.canAccessAzureStorageQueue()]);
    return responses.every(v => !!v);
  }

  async canAccessPupilAuthURL() {
    return new Promise(async (resolve) => {
      await this.http.get(APP_CONFIG.authPingURL, { observe: 'response' })
        .pipe(first())
        .toPromise()
        .then(data => {
          return resolve(true);
        })
        .catch(() => {
          return resolve(false);
        });
    });
  }

  async canAccessAzureStorageQueue() {
    const retryConfig = {
      errorDelay: this.testPupilConnectionDelay,
      errorMaxAttempts: this.testPupilConnectionMaxAttempts
    };
    try {
      await this.azureQueueService.addMessage(
        this.testPupilConnectionQueueName,
        this.testPupilConnectionQueueUrl,
        this.testPupilConnectionQueueToken,
        {},
        retryConfig);
    } catch (err) {
      return false;
    }
    return true;
  }
}
