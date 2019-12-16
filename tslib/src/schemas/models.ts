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
  version: number
  checkCode: string
  schoolUUID: string
  archive: string
}

export interface ValidateCheckMessageV1 {
  checkCode: string
  schoolUUID: string
  version: number
}

export interface MarkCheckMessageV1 {
  checkCode: string
  schoolUUID: string
  version: number
}

export interface ReceivedCheckTableEntity {
  PartitionKey: string // schoolUUID
  RowKey: string // checkCode
  archive: string
  checkReceivedAt: Date
  checkVersion: number
  isValid?: boolean
  validatedAt?: Date
  validationError?: string
  answers?: string
  mark?: number
  markedAt?: Date
  markError?: string
  maxMarks?: number
}
