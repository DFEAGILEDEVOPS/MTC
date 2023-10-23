import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { default as connectivityErrorMessages } from '../connectivity-service/connectivity-error-messages'

/**
 * Declaration of config class
 */
export interface IAppConfig {
  applicationInsightsInstrumentationKey: string;
  apiBaseUrl: string
  checkStartAPIErrorDelay: number;
  checkStartAPIErrorMaxAttempts: number;
  checkSubmissionAPIErrorMaxAttempts: number;
  checkSubmissionApiErrorDelay: number;
  connectivityCheckEnabled: boolean;
  connectivityCheckViewMinDisplay: number
  feedbackAPIErrorDelay: number;
  feedbackAPIErrorMaxAttempts: number;
  loginPendingViewMinDisplay: number
  production: boolean;
  pupilPrefsAPIErrorDelay: number;
  pupilPrefsAPIErrorMaxAttempts: number;
  submissionPendingViewMinDisplay: number;
  submissionUrl: string;
  submitsToCheckReceiver: boolean;
  supportNumber: string;
   testPupilConnectionDelay: number
   testPupilConnectionMaxAttempts: number
   testPupilConnectionQueueName: string
   testPupilConnectionQueueToken: string
   testPupilConnectionQueueUrl: string
   websiteOffline: boolean
}

export class AppConfig implements IAppConfig {
  readonly applicationInsightsInstrumentationKey: string
  readonly apiBaseUrl: string
  readonly checkStartAPIErrorDelay: number
  readonly checkStartAPIErrorMaxAttempts: number
  readonly checkSubmissionAPIErrorMaxAttempts: number
  readonly checkSubmissionApiErrorDelay: number
  readonly connectivityCheckEnabled: boolean
  readonly connectivityCheckViewMinDisplay: number
  readonly feedbackAPIErrorDelay: number
  readonly feedbackAPIErrorMaxAttempts: number
  readonly loginPendingViewMinDisplay: number
  readonly production: boolean
  readonly pupilPrefsAPIErrorDelay: number
  readonly pupilPrefsAPIErrorMaxAttempts: number
  readonly submissionPendingViewMinDisplay: number
  readonly submissionUrl: string
  readonly submitsToCheckReceiver: boolean
  readonly supportNumber: string
  readonly testPupilConnectionDelay: number
  readonly testPupilConnectionMaxAttempts: number
  readonly testPupilConnectionQueueName: string
  readonly testPupilConnectionQueueToken: string
  readonly testPupilConnectionQueueUrl: string
  readonly websiteOffline: boolean
}

class MockAppConfig implements IAppConfig {
  applicationInsightsInstrumentationKey: string
  apiBaseUrl = 'apiBaseUrl'
  checkStartAPIErrorDelay: 9
  checkStartAPIErrorMaxAttempts = 3
  checkSubmissionAPIErrorMaxAttempts = 3
  checkSubmissionApiErrorDelay = 10
  connectivityCheckEnabled = false
  connectivityCheckViewMinDisplay = 20
  feedbackAPIErrorDelay = 10
  feedbackAPIErrorMaxAttempts = 11
  loginPendingViewMinDisplay = 2
  production = false
  pupilPrefsAPIErrorDelay = 13
  pupilPrefsAPIErrorMaxAttempts = 3
  submissionPendingViewMinDisplay = 14
  submissionUrl = 'submissionUrl'
  submitsToCheckReceiver = false
  supportNumber = '000'
  testPupilConnectionDelay = 15
  testPupilConnectionMaxAttempts = 3
  testPupilConnectionQueueName = 'testPupilConnectionQueueName'
  testPupilConnectionQueueToken = 'testPupilConnectionQueueToken'
  testPupilConnectionQueueUrl = 'testPupilConnectionQueueUrl'
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
      this.errorMessages.push(connectivityErrorMessages.settingsError)
      return false
    }
  }
}
