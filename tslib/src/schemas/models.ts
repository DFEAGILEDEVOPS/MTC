export interface SubmittedCheckV1 {
  answers: Array<Record<string, unknown>>
  audit: Array<Record<string, unknown>>
  config: Record<string, unknown>
  device: Record<string, unknown>
  inputs: Array<Record<string, unknown>>
  pupil: Record<string, unknown>
  questions: Array<Record<string, unknown>>
  school: Record<string, unknown>
  tokens: Record<string, unknown>
  checkCode: string
}

export interface SubmittedCheckMessageV2 {
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

// markedAt is actually a string inside the Azure Storage table
export interface MarkedCheckTableEntity {
  PartitionKey: string // schoolUUID
  RowKey: string // checkCode
  Timestamp: Date // row creation date
  mark: number
  maxMarks: number
  markedAnswers: string // contains JSON
  markedAt: string
}
