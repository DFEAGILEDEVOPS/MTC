export interface IMonotonicTimeDto {
  milliseconds?: number
  legacyDate?: string
  sequenceNumber?: number
}

export interface MarkedCheck {
  mark: number
  checkCode: string
  maxMarks: number
  markedAnswers: MarkedAnswer[]
  markedAt: string
}

export interface Answer {
  factor1: number
  factor2: number
  answer: string
  sequenceNumber: number
  question: string
  clientTimestamp: string
  monotonicTime?: IMonotonicTimeDto
}

export interface MarkedAnswer extends Answer {
  isCorrect: boolean
}

export interface ValidatedCheck {
  checkCode: string
  schoolUUID: string
  config: Config
  device: Device
  pupil: Pupil
  questions: Question[]
  school: School
  tokens: Tokens
  audit: Audit[]
  inputs: Input[]
  answers: Answer[]
}

export interface Audit {
  type: string
  clientTimestamp: string
  data?: Data
  monotonicTime?: IMonotonicTimeDto
}

export interface Data {
  question: string
  sequenceNumber?: number
  isWarmup?: boolean
  monotonicTime?: IMonotonicTimeDto
}

export interface Config {
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

export interface Device {
  battery: Battery
  cpu: CPU
  navigator: Navigator
  networkConnection: NetworkConnection
  screen: Screen
  appUsageCounter: number
}

export interface Battery {
  isCharging: boolean
  levelPercent: number
  chargingTime: number
  dischargingTime: null
}

export interface CPU {
  hardwareConcurrency: number
}

export interface Navigator {
  userAgent: string
  platform: string
  language: string
  cookieEnabled: boolean
  doNotTrack: null
}

export interface NetworkConnection {
  downlink: number
  effectiveType: string
  rtt: number
}

export interface Screen {
  screenWidth: number
  screenHeight: number
  outerWidth: number
  outerHeight: number
  innerWidth: number
  innerHeight: number
  colorDepth: number
  orientation: string
}

export interface Input {
  input: string
  eventType: string
  clientTimestamp: string
  question: string
  sequenceNumber: number
}

export enum EventType {
  Keydown = 'keydown'
}

export interface Pupil {
  checkCode: string
}

export interface Question {
  order: number
  factor1: number
  factor2: number
}

export interface School {
  name: string
  uuid: string
}

export interface Tokens {
  checkStarted: Token
  pupilPreferences: Token
  pupilFeedback: Token
  jwt: Jwt
  checkComplete: Token
}

export interface Token {
  token: string
  url: string
  queueName: string
}

export interface Jwt {
  token: string
}

export interface ICheckCompletionMessage {
  validatedCheck: ValidatedCheck
  markedCheck: MarkedCheck
}

//
// DB models
//
export interface DBQuestion {
  id: number
  factor1: number
  factor2: number
  code: string
  isWarmup: boolean
}

export interface DBEventType {
  id: number
  eventType: string
  eventDescription: string
}
