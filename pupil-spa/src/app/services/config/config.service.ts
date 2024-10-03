import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

/**
 * Declaration of config class
 */
export interface IAppConfig {
  applicationInsightsConnectionString: string;
  apiBaseUrl: string
  checkStartAPIErrorDelay: number;
  checkStartAPIErrorMaxAttempts: number;
  checkSubmissionAPIErrorMaxAttempts: number;
  checkSubmissionApiErrorDelay: number;
  feedbackAPIErrorDelay: number;
  feedbackAPIErrorMaxAttempts: number;
  loginPendingViewMinDisplay: number
  production: boolean;
  pupilPrefsAPIErrorDelay: number;
  pupilPrefsAPIErrorMaxAttempts: number;
  submissionPendingViewMinDisplay: number;
  submitsToCheckReceiver: boolean;
  supportNumber: string;
  websiteOffline: boolean
}

export class AppConfig implements IAppConfig {
  readonly applicationInsightsConnectionString: string
  readonly apiBaseUrl: string
  readonly checkStartAPIErrorDelay: number
  readonly checkStartAPIErrorMaxAttempts: number
  readonly checkSubmissionAPIErrorMaxAttempts: number
  readonly checkSubmissionApiErrorDelay: number
  readonly feedbackAPIErrorDelay: number
  readonly feedbackAPIErrorMaxAttempts: number
  readonly loginPendingViewMinDisplay: number
  readonly production: boolean
  readonly pupilPrefsAPIErrorDelay: number
  readonly pupilPrefsAPIErrorMaxAttempts: number
  readonly submissionPendingViewMinDisplay: number
  readonly submitsToCheckReceiver: boolean
  readonly supportNumber: string
  readonly websiteOffline: boolean
}

class MockAppConfig implements IAppConfig {
  applicationInsightsConnectionString: 'mockConnectionString'
  apiBaseUrl = 'apiBaseUrl'
  checkStartAPIErrorDelay: 9
  checkStartAPIErrorMaxAttempts = 3
  checkSubmissionAPIErrorMaxAttempts = 3
  checkSubmissionApiErrorDelay = 10
  feedbackAPIErrorDelay = 10
  feedbackAPIErrorMaxAttempts = 11
  loginPendingViewMinDisplay = 2
  production = false
  pupilPrefsAPIErrorDelay = 13
  pupilPrefsAPIErrorMaxAttempts = 3
  submissionPendingViewMinDisplay = 14
  submitsToCheckReceiver = false
  supportNumber = '000'
  websiteOffline = false
}

/**
 * Global variable containing actual config to use.
 */
export let APP_CONFIG: IAppConfig

/**
 * Exported function -- to work with AOT
 * @param {AppConfigService} configService
 * @returns {Function}
 */
export function loadConfigService (configService: AppConfigService): Function {
  return () => configService.load()
}

/**
 * Mock helper
 * @returns {Function}
 */
export function loadConfigMockService (): Function {
  return () => {
    APP_CONFIG = new MockAppConfig()
    return Promise.resolve(true)
  }
}

/**
 * Dynamically initialise configuration at runtime
 */
@Injectable()
export class AppConfigService {
  private configFileURL = '/assets/config.json'

  errorMessages = new Array<string>()

  constructor (private http: HttpClient) {
  }

  /**
   * Parse the config file through http, throw a Server error if unavailable
   */
  public async load (): Promise<Boolean> {
    try {
      const data = await this.http.get(this.configFileURL).toPromise()
      const t = new AppConfig()
      APP_CONFIG = Object.assign(t, data)
      return true
    } catch (error) {
      this.errorMessages.push('There was a problem getting the settings')
      return false
    }
  }
}
