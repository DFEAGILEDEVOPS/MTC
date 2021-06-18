
export interface ICheckMarkerFunctionBindings {
  receivedCheckTable: any[]
  checkNotificationQueue: any[]
  checkResultTable: any[]
}

export interface Answer {
  factor1: number
  factor2: number
  answer: string
  sequenceNumber: number
  question: string
  clientTimestamp: string
}

export interface MarkedAnswer extends Answer {
  isCorrect: boolean
}

export interface CheckFormQuestion {
  f1: number
  f2: number
}

export interface MarkingData {
  answers: MarkedAnswer[]
  formQuestions: CheckFormQuestion[]
  results: any
}

export interface Mark {
  mark: number
  maxMarks: number
  processedAt: Date
}

export interface CheckResult {
  checkCode: string
  mark: number
  maxMarks: number
  markedAnswers: MarkedAnswer[]
  markedAt: Date
}
