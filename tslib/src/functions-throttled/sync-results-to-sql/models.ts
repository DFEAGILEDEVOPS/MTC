import { MarkedAnswer, Answer } from '../../functions/check-marker/models'

interface IDevice {
  battery: {
    isCharging: number | null,
    levelPercent: number | null,
    chargingTime: number | null,
    dischargingTime: number | null
  },
  cpu: {
    hardwareConcurrency: number | null
  },
  navigator: {
    userAgent: string | null,
    platform: string | null,
    language: string | null,
    cookieEnabled: boolean | null,
    doNotTrack: boolean | null
  },
  networkConnection: {
    downlink: number | null,
    effectiveType: string | null,
    rtt: number | null
  },
  screen: {
    screenWidth: number | null,
    screenHeight: number | null,
    outerWidth: number | null,
    outerHeight: number | null,
    innerWidth: number | null,
    innerHeight: number | null,
    colorDepth: number | null,
    orientation: string | null
  },
  appUsageCounter: number
}

interface Audit {
  type: string,
  clientTimestamp: string,
  data: object
}

interface Input {
  input: string,
  eventType: string,
  clientTimestamp: string,
  question: string,
  sequenceNumber: number
}

export interface ICheckCompletionMessage {
  validatedCheck: {
    checkCode: string,
    schoolUUID: string,
    answers: Answer[],
    audits: Audit[],
    device: IDevice,
    inputs: Input[]
  },
  markedCheck: {
    mark: number,
    maxMark: number,
    markedAt: string,
    markedAnswers: MarkedAnswer[]
  }
}
