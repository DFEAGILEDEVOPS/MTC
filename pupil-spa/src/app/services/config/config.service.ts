import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

/**
 * Declaration of config class
 */
export class AppConfig {
  readonly apiURL: string;
  readonly applicationInsightsInstrumentationKey: string;
  readonly authURL: string;
  readonly checkStartAPIErrorDelay: number;
  readonly checkStartAPIErrorMaxAttempts: number;
  readonly checkStartedURL: string;
  readonly checkSubmissionApiErrorDelay: number;
  readonly checkSubmissionAPIErrorMaxAttempts: number;
  readonly checkSubmissionURL: string;
  readonly featureUseHpa: boolean;
  readonly googleAnalyticsTrackingCode: string;
  readonly production: boolean;
  readonly submissionPendingViewMinDisplay: number;
  readonly supportNumber: string;
  readonly feedbackAPIErrorDelay: number;
  readonly feedbackAPIErrorMaxAttempts: number;
  readonly pupilPrefsAPIErrorDelay: number;
  readonly pupilPrefsAPIErrorMaxAttempts: number;
  readonly buttonHideDelay: number;
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

  constructor(private http: HttpClient) {
  }

  /**
   * Parse the config file through http, throw a Server error if unavailable
   */
  public load(): Promise<Boolean> {
    return new Promise((resolve, reject) => {
      this.http.get('/public/config.json').catch((error: any): any => {
        reject(true);
        return Observable.throw('Server error');
      }).subscribe((envResponse: any) => {
        const t = new AppConfig();
        APP_CONFIG = Object.assign(t, envResponse);
        resolve(true);
      });
    });
  }
}
