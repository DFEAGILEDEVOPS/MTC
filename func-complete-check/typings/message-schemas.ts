export interface SubmittedCheckV1 {
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

export interface SubmittedCheckMessageV3 {
  version: string
  checkCode: string
  schoolUUID: string
  archive: string
}

export interface ValidateCheckMessageV1 {
  checkCode: string
  schoolUUID: string
  version: string
}

export interface MarkCheckMessageV1 {
  checkCode: string
  schoolUUID: string
  version: string
}

export interface ReceivedCheck {
  PartitionKey: string // schoolUUID
  RowKey: string // checkCode
  archive: string
  checkReceivedAt: Date
  checkVersion: number
  isValid?: boolean
  validatedAt?: Date
  validationError?: string
  mark?: number
  markedAt?: Date
  answers?: string
}

export interface ValidatedCheck {
  PartitionKey: string // schoolUUID
  RowKey: string // checkCode
  archive: string
  checkReceivedAt: Date
  checkVersion: number
  isValid: boolean
  validatedAt: Date
  mark?: number
  markedAt?: Date
  answers: string
}
