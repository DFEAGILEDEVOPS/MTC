import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

/**
 * Declaration of config class
 */
export class AppConfig {
  readonly apiURL: string;
  readonly authURL: string;
  readonly checkStartedURL: string;
  readonly checkSubmissionURL: string;
  readonly production: boolean;
  readonly checkStartAPIErrorDelay: number;
  readonly checkStartAPIErrorMaxAttempts: number;
  readonly checkSubmissionApiErrorDelay: number;
  readonly checkSubmissionAPIErrorMaxAttempts: number;
  readonly submissionPendingViewMinDisplay: number;
  readonly supportNumber: string;
  readonly googleAnalyticsTrackingCode: string;
}

/**
 * Global variable containing actual config to use.
 */
export let APP_CONFIG: AppConfig;

/**
 * Exported function so that it works with AOT
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
 * @param {AppConfigService} configService
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
