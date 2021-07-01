export interface SubmittedCheck {
  checkCode: string
  schoolUUID: string
  config: CheckConfig
  device: {
    battery: {
      isCharging: boolean
      levelPercent: number
      chargingTime: number
      dischargingTime: number | null
    }
    cpu: {
      hardwareConcurrency: number
    }
    navigator: {
      userAgent: string
      platform: string
      language: string
      cookieEnabled: boolean
      doNotTrack: boolean | null
    }
    networkConnection: {
      downlink: number
      effectiveType: string
      rtt: number
    }
    screen: {
      screenWidth: number
      screenHeight: number
      outerWidth: number
      outerHeight: number
      innerWidth: number
      innerHeight: number
      colorDepth: number
      orientation: string // TODO range of values?
    }
    deviceId: string
    appUsageCounter: number
  }
  pupil: {
    checkCode: string
    inputAssistant: {
      firstName: string
      lastName: string
    }
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
    jwt: {
      token: string
    }
  }
  audit: CompleteCheckAuditEntry[]
  inputs: CompleteCheckInputEntry[]
  answers: CompleteCheckAnswer[]
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

export interface QueueAuthToken {
  token: string
  url: string
  queueName: string
}

export interface CheckQuestion {
  order: number
  factor1: number
  factor2: number
}

export interface CompleteCheckAnswer {
  factor1: number
  factor2: number
  answer: number
  sequenceNumber: number
  question: string
  clientTimestamp: string
}

export interface CompleteCheckInputEntry {
  input: string
  eventType: 'touch' | 'keydown' // TODO 'mouse' ??
  clientTimestamp: string
  question: string
  sequenceNumber: number
  relativeTiming: string
}

export enum AuditEntryType {
  WarmupStarted = 'WarmupStarted',
  WarmupIntroRendered = 'WarmupIntroRendered',
  PauseRendered = 'PauseRendered',
  QuestionRendered = 'QuestionRendered',
  QuestionTimerStarted = 'QuestionTimerStarted',
  QuestionTimerCancelled = 'QuestionTimerCancelled',
  UtteranceStarted = 'UtteranceStarted',
  UtteranceEnded = 'UtteranceEnded',
  QuestionReadingStarted = 'QuestionReadingStarted',
  QuestionReadingEnded = 'QuestionReadingEnded',
  CheckStarted = 'CheckStarted',
  CheckStartedApiCalled = 'CheckStartedApiCalled',
  QuestionAnswered = 'QuestionAnswered',
  WarmupCompleteRendered = 'WarmupCompleteRendered',
  CheckSubmissionPending = 'CheckSubmissionPending',
  CheckSubmissionApiCalled = 'CheckSubmissionApiCalled',
  QuestionTimerEnded = 'QuestionTimerEnded'
}

export type AuditEntryType1 = 'WarmupStarted' | 'WarmupIntroRendered' | 'PauseRendered' |
'QuestionRendered' | 'QuestionTimerStarted' | 'QuestionTimerCancelled' | 'UtteranceStarted' | 'UtteranceEnded' |
'QuestionReadingStarted' | 'QuestionReadingEnded' | 'CheckStarted' | 'CheckStartedApiCalled' | 'QuestionAnswered' |
'WarmupCompleteRendered' | 'CheckSubmissionPending' | 'CheckSubmissionApiCalled'

export interface CompleteCheckAuditEntry {
  type: AuditEntryType
  clientTimestamp: string
  relativeTiming: string
  data?: {
    practiseSequenceNumber?: number
    sequenceNumber?: number
    question: string
    isWarmup?: boolean
  }
}
