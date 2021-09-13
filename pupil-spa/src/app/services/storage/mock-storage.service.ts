import { AccessArrangementsStorageKey, CheckStateStorageKey, InputsStorageKey } from './storageKey'
import { AccessArrangements } from '../../access-arrangements'
import { Answer } from '../answer/answer.model'
import { AuditEntry } from '../audit/auditEntry'
import { Question } from '../question/question.model'
import { IStorageService } from './storage.service'

export class StorageServiceMock implements IStorageService {
  clear() {}
  getAccessArrangements (key: AccessArrangementsStorageKey) { return }
  getAllItems () { return }
  getCheckStartTime () { return }
  getCheckState (key: CheckStateStorageKey) { return }
  getCompletedSubmission () { return }
  getConfig () { return }
  getDeviceData () { return }
  getFeedback () { return }
  getKeys () { return [] }
  getPendingSubmission () { return }
  getPupil () { return }
  getQuestions () { return }
  getSchool () { return }
  getToken () { return }
  removeCheckStartTime () {}
  removeCheckState () {}
  removeTimeout () {}
  setAccessArrangements (accessArrangements: AccessArrangements) {}
  setAnswer (answer: Answer) {}
  setAuditEntry (auditEntry: AuditEntry) {}
  setCheckStartTime (checkStartTime: Number) {}
  setCheckState (state: Number) {}
  setCompletedSubmission (isCompleted: Boolean) {}
  setConfig (config: Object) {}
  setDeviceData (deviceData: any) {}
  setFeedback (feedback: Object) {}
  setInput (questionInput: Object) {}
  setPendingSubmission (isPending: Boolean) {}
  setPupil (pupilData: Object) {}
  setQuestions (questions: Question[]) {}
  setSchool (school: Object) {}
  setTimeout (timeout: Object) {}
  setToken (token: string) {}
}
