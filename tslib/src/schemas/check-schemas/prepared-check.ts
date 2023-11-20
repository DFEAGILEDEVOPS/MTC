import { type CheckConfig, type CheckQuestion, type QueueAuthToken } from './validated-check'

/**
 * @description As of 25th June 2021 this is a full definition of the prepared check object that we store in Redis.
 * This is constructed by prepare-check-service in admin/services
 */
export interface PreparedCheck {
  checkCode: string
  config: CheckConfig
  createdAt: string
  updatedAt: string
  pinExpiresAtUtc: string
  pinValidFromUtc: string
  pupil: {
    firstName: string
    lastName: string
    dob: string
    checkCode: string
    uuid: string
  }
  questions: CheckQuestion[]
  school: {
    name: string
    uuid: string
  }
  tokens: {
    checkStarted: QueueAuthToken
    pupilPreferences: QueueAuthToken
    pupilFeedback: QueueAuthToken
    checkComplete?: QueueAuthToken
    checkSubmission: {
      token: string
      url: string
    }
  }
}
