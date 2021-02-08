export interface PsychometricReport {
  PupilId: string
  createdAt: moment.Moment | null
  updatedAt: moment.Moment | null
  DOB: moment.Moment | null
  Gender: string | null
  Forename: string | null
  Surname: string | null
  FormMark: number | null
  QDisplayTime: number | null
  PauseLength: number | null
  AccessArr: string | null
  RestartReason: string | null
  RestartNumber: number | null
  ReasonNotTakingCheck: number | null
  PupilStatus: string | null
  DeviceType: string | null
  DeviceTypeModel: string | null
  DeviceId: string | null
  BrowserType: string | null
  SchoolName: string | null
  Estab: number | null
  SchoolURN: number | null
  LANum: number | null
  AttemptId: string | null
  FormID: string | null
  TestDate: moment.Moment | null
  TimeStart: moment.Moment | null
  TimeComplete: moment.Moment | null
  TimeTaken: number | null

  // Questions

  Q1ID: string | null
  Q1Response: string | null
  Q1InputMethods: string | null
  Q1K: string | null
  Q1Sco: number | null
  Q1ResponseTime: number | null
  Q1Timeout: number | null
  Q1TimeoutResponse: number | null
  Q1TimeOutSco: number | null
  Q1tLoad: moment.Moment | null
  Q1tFirstKey: moment.Moment | null
  Q1tLastKey: moment.Moment | null
  Q1OverallTime: number | null
  Q1RecallTime: number | null
  Q1ReaderStart: number | null
  Q1ReaderEnd: number | null
}
