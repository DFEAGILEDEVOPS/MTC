export interface SubmittedCheckMessage {
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
  partitionKey: string // schoolUUID
  rowKey: string // checkCode
  archive?: string
  answers?: string
  checkReceivedAt: Date
  checkVersion: number
  isValid?: boolean
  mark?: number
  markedAt?: Date
  markError?: string
  maxMarks?: number
  processingError?: string
  validatedAt?: Date
}

/**
 * When a table entity is retrieved using function bindings, the partition key and row key are capitalised.
 * When we retrieve via @azure/data-tables package, they use camel case.
 */
export interface ReceivedCheckFunctionBindingEntity {
  PartitionKey: string
  RowKey: string
  archive?: string
  answers?: string
  checkReceivedAt: Date
  checkVersion: number
  isValid?: boolean
  mark?: number
  markedAt?: Date
  markError?: string
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
