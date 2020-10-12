export interface SubmittedCheckV1 {
  answers: Record<string, unknown>[]
  audit: Record<string, unknown>[]
  config: Record<string, unknown>
  device: Record<string, unknown>
  inputs: Record<string, unknown>[]
  pupil: Record<string, unknown>
  questions: Record<string, unknown>[]
  school: Record<string, unknown>
  tokens: Record<string, unknown>
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
  answers?: string
  archive: string
  checkReceivedAt: Date
  checkVersion: number
  isValid?: boolean
  mark?: number
  markError?: string
  markedAt?: Date
  maxMarks?: number
  processingError?: string
  validatedAt?: Date
}
