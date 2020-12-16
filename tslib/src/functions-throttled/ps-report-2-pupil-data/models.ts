import moment from 'moment'

export type nullOrUndef = undefined | null

export interface Pupil {
  attendanceId: number | undefined
  checkComplete: boolean
  currentCheckId: number | undefined
  dateOfBirth: moment.Moment
  forename: string
  gender: 'M' | 'F'
  id: number
  lastname: string
  notTakingCheckReason: string | undefined
  slug: string
  schoolId: number
  upn: string
}

export interface School {
  estabCode: number
  id: number
  laCode: number
  name: string
  slug: string
  urn: number
}

export interface CheckConfig {
  audibleSounds: boolean
  checkTime: number
  colourContrast: boolean
  fontSize: boolean
  inputAssistance: boolean
  loadingTime: number
  nextBetweenQuestions: boolean
  numpadRemoval: boolean
  practice: boolean
  questionReader: boolean
  questionTime: number
  compressCompletedCheck: boolean
}

// interface CheckWindow {
//   adminEndDate: moment.Moment
//   adminStartDate: moment.Moment
//   checkEndDate: moment.Moment
//   checkStartDate: moment.Moment
//   familiarisationEndDate: moment.Moment
//   familiarisationStartDate: moment.Moment
//   id: number
//   isDeleted: boolean
//   name: string
//   slug: string
// }
//
// interface Item {
//   f1: number
//   f2: number
//   questionNumber: number
// }
//
// interface CheckForm {
//   id: number
//   items: Item[]
//   name: string
// }
//
// interface Check {
//   checkCode: string
//   checkFormId: number
//   checkWindowId: number
//   complete: boolean
//   completedAt: moment.Moment
//   inputAssistantAddedRetrospectively: boolean
//   isLiveCheck: boolean
//   mark: number
//   processingFailed: boolean
//   pupilLoginDate: moment.Moment
//   received: boolean
//   restartNumber: number
// }
//
// interface Device {
//   type: 'Tablet' | 'Desktop' | 'Mobile' | 'Other'
//   browserFamily: string
//   browserVersion: string
//   deviceTypeModel: string
//   deviceId: string
// }
//
// interface Input {
//   input: string
//   inputType: 'M' | 'K' | 'T' | 'P' | 'X'
//   browserTimestamp: moment.Moment
// }
//
// interface Answer {
//   response: string
//   inputType: 'k' | 't' | 'm' | 'x'
//   isCorrect: boolean
//   questionCode: string
//   question: string
//   browserTimestamp: moment.Moment
//   inputs: Input[]
// }
//
// interface Event {
//   id: number
//   type: string
//   browserTimestamp: moment.Moment
//   data?: object
//   questionCode?: string
//   questionNumber: number
// }

export type CheckConfigOrNull = CheckConfig | null

export interface PupilResult {
  // answers: Answer[]
  // check: Check
  checkConfig: CheckConfigOrNull
  // checkForm: CheckForm
  // checkWindow: CheckWindow
  // device: Device
  // events: Event[]
  pupil: Pupil
  school: School
}
