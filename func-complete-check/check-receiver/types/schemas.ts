export interface ICompleteCheck {
  answers: Array<object>
  audit: Array<object>
  config: object
  device: object
  inputs: Array<object>
  pupil: object
  questions: Array<object>
  school: object
  tokens: object
  checkCode: string
}

export interface ICompleteCheckMessage {
  version: string
  checkCode: string
  schoolUUID: string
  archive: string
}
