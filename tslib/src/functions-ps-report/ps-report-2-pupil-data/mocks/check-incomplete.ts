import { type Check } from '../pupil-data.models'

// A check that has not been logged into yet.
export const check: Check = {
  id: 31,
  checkCode: 'xyz-def-988',
  checkFormId: 9,
  checkWindowId: 1,
  complete: false,
  completedAt: null,
  inputAssistantAddedRetrospectively: false,
  isLiveCheck: true,
  mark: null,
  processingFailed: false,
  pupilLoginDate: null,
  received: false,
  restartNumber: 0,
  restartReason: null
}
