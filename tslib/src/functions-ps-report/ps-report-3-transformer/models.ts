import { type ReportLineAnswer } from './report-line-answer.class'
import type moment from 'moment'

export interface IReportLineBase {
  // Pupil
  PupilDatabaseId: number
  DOB: moment.Moment | null
  Gender: string
  PupilUPN: string
  Forename: string
  Surname: string
  ReasonNotTakingCheck: DfEAbsenceCode | null
  PupilStatus: string | null
  ImportedFromCensus: boolean
  // School
  SchoolName: string
  Estab: number | null
  SchoolURN: number | null
  LAnum: number | null
  ToECode: number | null
  // Settings
  QDisplayTime: number | null
  PauseLength: number | null
  AccessArr: string | null
  // Check
  AttemptID: string | null
  FormID: string | null
  TestDate: moment.Moment | null
  TimeStart: moment.Moment | null
  TimeComplete: moment.Moment | null
  TimeTaken: number | null // seconds with ms to 3 decimal places, e.g. 198.123
  RestartNumber: number | null
  RestartReason: number | null
  FormMark: number | null

  // Device
  BrowserType: string | null
  DeviceID: string | null
}

export interface IReportLineAnswer {
  questionNumber: number | null
  id: string | null
  response: string | null
  inputMethods: string | null
  keystrokes: string | null
  score: number | null
  firstKey: moment.Moment | null
  lastKey: moment.Moment | null
  responseTime: number | null
  timeout: boolean | null
  timeoutResponse: boolean | null
  timeoutScore: boolean | null
  loadTime: moment.Moment | null
  overallTime: number | null
  recallTime: number | null
  questionReaderStart: moment.Moment | null
  questionReaderEnd: moment.Moment | null
}

export interface IPsychometricReportLine extends IReportLineBase {
  // Answers
  answers: IReportLineAnswer[]
}

export interface WorkingReportLine extends IReportLineBase {
  // Answers
  answers: ReportLineAnswer[]
}

export type DfEAbsenceCode = 'Z' | 'A' | 'L' | 'U' | 'B' | 'J' | 'Q' | 'H'
