export interface ValidCheck {
  checkCode: string
  schoolUUID: string
  config: CheckConfig
  device: {
    battery?: {
      isCharging?: boolean
      levelPercent?: number
      chargingTime?: number
      dischargingTime?: number | null
    }
    cpu: {
      hardwareConcurrency?: number
    }
    navigator: {
      userAgent?: string
      platform?: string
      language?: string
      cookieEnabled?: boolean
      doNotTrack?: boolean | null
    }
    networkConnection?: {
      downlink?: number
      effectiveType?: string
      rtt?: number
    }
    screen?: {
      screenWidth?: number
      screenHeight?: number
      outerWidth?: number
      outerHeight?: number
      innerWidth?: number
      innerHeight?: number
      colorDepth?: number
      orientation?: string
    }
    deviceId?: string
    appUsageCounter?: number
  }
  pupil: PupilInfo
  questions: CheckQuestion[]
  school: SchoolInfo
  tokens: TokenInfo
  audit: CompleteCheckAuditEntry[]
  inputs: CompleteCheckInputEntry[]
  answers: CompleteCheckAnswer[]
}

export interface TokenInfo {
  checkStarted: QueueAuthToken
  pupilPreferences: QueueAuthToken
  pupilFeedback: QueueAuthToken
  checkComplete?: QueueAuthToken
  jwt: {
    token: string
  }
}

export interface PupilInfo {
  checkCode: string
  inputAssistant?: {
    firstName?: string
    lastName?: string
  }
}

export interface SchoolInfo {
  name: string
  uuid: string
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
  answer: string
  sequenceNumber: number
  question: string
  clientTimestamp: string
}

export enum InputEventType {
  Touch = 'touch',
  Mouse = 'mouse',
  Keyboard = 'keyboard',
  Pen = 'pen',
  Unknown = 'unknown'
}

export interface CompleteCheckInputEntry {
  input: string
  eventType: InputEventType
  clientTimestamp: string
  question: string
  sequenceNumber: number
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
  data?: {
    practiseSequenceNumber?: number
    sequenceNumber?: number
    question: string
    isWarmup?: boolean
  }
}

export function getValidatedCheck (): ValidCheck {
  const answers: CompleteCheckAnswer[] = []
  for (let index = 0; index < 25; index++) {
    answers.push({
      answer: `${index}`,
      clientTimestamp: '',
      factor1: index,
      factor2: index,
      question: `${index}x${index}`,
      sequenceNumber: index + 1
    })
  }
  const check: ValidCheck = {
    answers,
    audit: [],
    checkCode: '2f39b888-892e-4d0a-918b-c52288b1e54f',
    config: {
      audibleSounds: false,
      checkTime: 0,
      colourContrast: false,
      compressCompletedCheck: false,
      fontSize: false,
      inputAssistance: false,
      loadingTime: 0,
      nextBetweenQuestions: false,
      numpadRemoval: false,
      practice: false,
      questionReader: false,
      questionTime: 0
    },
    device: {
      cpu: {
        hardwareConcurrency: 4
      },
      navigator: {
      }
    },
    inputs: [],
    pupil: {
      checkCode: ''
    },
    questions: [],
    tokens: {
      checkStarted: {
        queueName: '',
        token: '',
        url: ''
      },
      pupilFeedback: {
        queueName: '',
        token: '',
        url: ''
      },
      jwt: {
        token: ''
      },
      pupilPreferences: {
        queueName: '',
        token: '',
        url: ''
      }
    },
    school: {
      name: '',
      uuid: ''
    },
    schoolUUID: ''
  }
  return check
}
