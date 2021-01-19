export interface PsychometricReportLine {
  // Pupil
  DOB: string
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
}
