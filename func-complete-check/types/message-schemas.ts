export interface CompleteCheckV1 {
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

export interface CompleteCheckMessageV3 {
  version: string
  checkCode: string
  schoolUUID: string
  archive: string
}

export interface ValidateCheckMessage {
  checkCode: string
  schoolUUID: string
  version: string
}

export interface MarkCheckMessage {
  checkCode: string
  schoolUUID: string
  version: string
}

export interface ReceivedCheck {
  PartitionKey: string //schoolUUID
  RowKey: string //checkCode
  archive: string
  checkReceivedAt: Date
  checkVersion: number
  validatedAt?: Date
  validationError?: string
  mark?: number
  markedAt?: Date
}
