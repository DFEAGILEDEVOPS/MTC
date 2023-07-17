import { type Check } from '../../../functions-ps-report/ps-report-2-pupil-data/models'
import moment from 'moment'

export const check: Check = {
  id: 30,
  checkCode: 'xyz-def-987',
  checkFormId: 9,
  checkWindowId: 1,
  complete: true,
  completedAt: moment('2021-01-21T09:00:16.000Z'),
  inputAssistantAddedRetrospectively: false,
  isLiveCheck: true,
  mark: 1,
  processingFailed: false,
  pupilLoginDate: moment('2021-01-21T09:00:00.000Z'),
  received: true,
  restartNumber: 2,
  restartReason: 'LOI'
}
