export interface CompleteCheckPayload {
  checkCode: string
  schoolUUID: string
  config: {
    audibleSounds: boolean
    checkTime: number
    colourContrast: boolean
    fontSize: false
    inputAssistance: boolean
    loadingTime: number
    nextBetweenQuestions: boolean
    numpadRemoval: boolean
    practice: boolean
    questionReader: boolean
    questionTime: boolean
    compressCompletedCheck: boolean
  }
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
  questions: Array<CompleteCheckQuestion>
  school: {
    name: string
    uuid: string
  }
  tokens: {
    checkStarted: QueueAuthToken
    pupilPreferences: QueueAuthToken
    pupilFeedback: QueueAuthToken
    checkComplete: QueueAuthToken
    jwt: {
      token: string
    }
  }
  audit: Array<CompleteCheckAuditEntry>
  inputs: Array<CompleteCheckInputEntry>
  answers: Array<CompleteCheckAnswer>
}

export interface QueueAuthToken {
  token: string
  url: string
  queueName: string
}

export interface CompleteCheckQuestion {
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

export interface CompleteCheckAuditEntry {
  type: 'WarmupStarted' | 'WarmupIntroRendered' | 'PauseRendered' |
    'QuestionRendered' | 'QuestionTimerStarted' | 'QuestionTimerCancelled' | 'UtteranceStarted' | 'UtteranceEnded' |
    'QuestionReadingStarted' | 'QuestionReadingEnded' | 'CheckStarted' | 'CheckStartedApiCalled' //TODO more
  clientTimestamp: string
  relativeTiming: string
  data?: {
    practiseSequenceNumber?: number
    sequenceNumber?: number
    question: string
    isWarmup?: boolean
  }
}
