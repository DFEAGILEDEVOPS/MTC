export interface PsychometricReportLine {
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
  TimeTaken: number | null // seconds with ms to 3 decimal places
  RestartNumber: number | null
  FormMark: number | null

  // Device
  DeviceType: string | null
  BrowserType: string | null
  DeviceTypeModel: string | null
  DeviceID: string | null
}
