import { first } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { default as connectivityErrorMessages} from '../connectivity-service/connectivity-error-messages';

/**
 * Declaration of config class
 */
export interface IAppConfig {
  applicationInsightsInstrumentationKey: string;
  authURL: string;
  authPingURL: string;
  checkStartAPIErrorDelay: number;
  checkStartAPIErrorMaxAttempts: number;
  checkSubmissionApiErrorDelay: number;
  checkSubmissionAPIErrorMaxAttempts: number;
  production: boolean;
  submissionPendingViewMinDisplay: number;
  supportNumber: string;
  feedbackAPIErrorDelay: number;
  feedbackAPIErrorMaxAttempts: number;
  pupilPrefsAPIErrorDelay: number;
  pupilPrefsAPIErrorMaxAttempts: number;
  testPupilConnectionEnabled: boolean;
  submitsToCheckReceiver: boolean;
}

export class AppConfig implements IAppConfig {
  readonly applicationInsightsInstrumentationKey: string;
  readonly authPingURL: string;
  readonly authURL: string;
  readonly checkStartAPIErrorDelay: number;
  readonly checkStartAPIErrorMaxAttempts: number;
  readonly checkSubmissionApiErrorDelay: number;
  readonly checkSubmissionAPIErrorMaxAttempts: number;
  readonly feedbackAPIErrorDelay: number;
  readonly feedbackAPIErrorMaxAttempts: number;
  readonly loginPendingViewMinDisplay: number;
  readonly production: boolean;
  readonly pupilPrefsAPIErrorDelay: number;
  readonly pupilPrefsAPIErrorMaxAttempts: number;
  readonly submissionPendingViewMinDisplay: number;
  readonly submitsToCheckReceiver: boolean;
  readonly supportNumber: string;
  readonly testPupilConnectionEnabled: boolean;
  readonly testPupilConnectionMaxRetries: number;
  readonly testPupilConnectionQueueName: string;
  readonly testPupilConnectionQueueToken: string;
  readonly testPupilConnectionQueueUrl: string;
  readonly testPupilConnectionRetryDelayMs: number;
  readonly testPupilConnectionViewMinDisplayMs: number;
  readonly websiteOffline: boolean;
}

/**
 * Global variable containing actual config to use.
 */
export let APP_CONFIG: AppConfig;

/**
 * Exported function -- to work with AOT
 * @param {AppConfigService} configService
 * @returns {Function}
 */
export function loadConfigService(configService: AppConfigService): Function {
  return () => {
    return configService.load();
  };
}

/**
 * Mock helper
 * @returns {Function}
 */
export function loadConfigMockService(): Function {
  return () => {
    APP_CONFIG = new AppConfig();
    return Promise.resolve(true);
  };
}

/**
 * Dynamically initialise configuration at runtime
 */
@Injectable()
export class AppConfigService {

  errorMessages = [];

  constructor(private http: HttpClient) {
  }

  /**
   * Parse the config file through http, throw a Server error if unavailable
   */
  public load(): Promise<Boolean> {
    return new Promise(async (resolve, reject) => {
      await this.http.get('/public/config.json', { observe: 'response' })
        .pipe(first())
        .toPromise()
        .then(data => {
          const t = new AppConfig();
          APP_CONFIG = Object.assign(t, data.body);
          return resolve(true);
        })
        .catch(() => {
          this.errorMessages.push(connectivityErrorMessages.pupilAuthError);
          return reject(false);
        });
    });
  }
}
