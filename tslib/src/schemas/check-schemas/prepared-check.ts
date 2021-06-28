import moment from 'moment'
import { CheckConfig, CheckQuestion, QueueAuthToken } from './submitted-check'

/**
 * @description As of 25th June 2021 this is a full definition of the prepared check object that we store in Redis.
 * This is constructed by prepare-check-service in admin/services
 */
export interface PreparedCheck {
  checkCode: string
  config: CheckConfig
  createdAt: moment.Moment
  pinExpiresAtUtc: moment.Moment
  pinValidFromUtc: moment.Moment
  pupil: {
    firstName: string
    lastName: string
    dob: moment.Moment
    checkCode: string
    uuid: string
  }
  questions: CheckQuestion[]
  school: {
    name: string
    uuid: string
  }
  updatedAt: moment.Moment
  schoolPin: string
  pupilPin: string
  tokens: {
    checkStarted: QueueAuthToken
    pupilPreferences: QueueAuthToken
    pupilFeedback: QueueAuthToken
    checkComplete?: QueueAuthToken
    jwt: {
      token: string
    }
  }
}
