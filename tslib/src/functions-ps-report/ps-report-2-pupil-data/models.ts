import moment from 'moment'

export interface Pupil {
  checkComplete: boolean | null
  currentCheckId: number | null
  dateOfBirth: moment.Moment
  forename: string
  gender: 'M' | 'F'
  id: number
  jobId: number | null
  lastname: string
  notTakingCheckReason: string | null
  notTakingCheckCode: NotTakingCheckCode | null
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
  typeOfEstablishmentCode: number
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

interface Item {
  f1: number
  f2: number
  questionNumber: number
}

export interface CheckForm {
  id: number
  items: Item[]
  name: string
}

export interface Check {
  id: number
  checkCode: string
  checkFormId: number
  checkWindowId: number
  complete: boolean
  completedAt: moment.Moment | null
  inputAssistantAddedRetrospectively: boolean
  isLiveCheck: boolean
  mark: number | null
  processingFailed: boolean
  pupilLoginDate: moment.Moment | null
  received: boolean
  restartNumber: number
  restartReason: RestartReasonCode | null
}

export interface Device {
  type: 'Tablet' | 'Desktop' | 'Mobile' | 'Other' | null
  typeModel: string | null
  browserFamily: string | null
  browserMajorVersion: number | null
  browserMinorVersion: number | null
  browserPatchVersion: number | null
  deviceId: string | null
}

export interface Input {
  answerId: number
  input: string
  inputType: 'M' | 'K' | 'T' | 'P' | 'X'
  browserTimestamp: moment.Moment
}

export type InputMap = Map<number, readonly Input[] | null>

export interface Answer {
  browserTimestamp: moment.Moment
  id: number
  inputs: readonly Input[] | null
  isCorrect: boolean
  question: string
  questionCode: string
  questionNumber: number
  response: string
}

export interface Event {
  browserTimestamp: moment.Moment
  data?: object
  id: number
  isWarmup: boolean | null
  question?: string | null
  questionCode?: string | null
  questionNumber?: number | null
  type: string
}

export type CheckConfigOrNull = CheckConfig | null
export type CheckOrNull = Check | null
export type CheckFormOrNull = CheckForm | null
export type AnswersOrNull = readonly Answer[] | null
export type DeviceOrNull = Device | null
export type EventsOrNull = readonly Event[] | null
export type nullOrUndef = undefined | null

/**
 * k = all the inputs were keyboard
 * m = all the inputs were touch
 * t = all the inputs were mouse
 * x = mixed inputs (e.g. a combination of keyboard and mouse)
 * null = there were no inputs to type
 */
export type AnswerInputType = 'k' | 't' | 'm' | 'x' | null

/**
 * This is the type sent as the output message to `ps-report-schools`
 */
export interface PupilResult {
  answers: AnswersOrNull
  check: CheckOrNull
  checkConfig: CheckConfigOrNull
  checkForm: CheckFormOrNull
  device: DeviceOrNull
  events: EventsOrNull
  pupil: Pupil
  school: School
}

/**
 * ABSNT: Absent during check window
 * LEFTT: Left school
 * INCRG: Incorrect registration
 * NOACC: Unable to access
 * BLSTD: Working below expectation
 * JSTAR: Just arrived and unable to establish abilities
 * ANLLD: Pupil results were annulled
 */
export type NotTakingCheckCode = 'ABSNT' | 'LEFTT' | 'INCRG' | 'NOACC' | 'BLSTD' | 'JSTAR' | 'ANLLD'

/**
 * LOI: Loss of internet
 * ITI: IT issues
 * CLD: Classroom disruption
 * DNC: Did not complete
 */
export type RestartReasonCode = 'LOI' | 'ITI' | 'CLD' | 'DNC'
