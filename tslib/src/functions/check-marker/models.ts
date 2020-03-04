
export interface ICheckMarkerFunctionBindings {
  receivedCheckTable: Array<any>
  checkNotificationQueue: Array<any>
  checkResultTable: Array<any>
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
  answers: Array<MarkedAnswer>
  formQuestions: Array<CheckFormQuestion>
  results: any
}

export interface Mark {
  mark: number
  maxMarks: number
  processedAt: Date
}

export interface CheckResult {
  checkCode: string,
  mark: number,
  maxMarks: number,
  markedAnswers: MarkedAnswer[]
  processedAt: Date
}
