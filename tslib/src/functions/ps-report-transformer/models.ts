import { ReportLineAnswer } from './report-line-answer.class'
import moment from 'moment'

export interface IReportLineBase {
  // Pupil
  DOB: moment.Moment | null
  Gender: string
  PupilID: string
  Forename: string
  Surname: string
  ReasonNotTakingCheck: number | null
  // School
  SchoolName: string
  Estab: number | null
  SchoolURN: number | null
  LAnum: number | null
  // Settings
  QDisplayTime: number | null
  PauseLength: number | null
  AccessArr: string
  // Check
  AttemptID: string
  FormID: string
  TestDate: moment.Moment | null
  TimeStart: moment.Moment | null
  TimeComplete: moment.Moment | null
  TimeTaken: number | null // seconds with ms to 3 decimal places, e.g. 198.123
  RestartNumber: number | null
  FormMark: number | null

  // Device
  DeviceType: string | null
  BrowserType: string | null
  DeviceTypeModel: string | null
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
  timeoutResponse: boolean | '' | null
  timeoutScore: boolean | '' | null
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
