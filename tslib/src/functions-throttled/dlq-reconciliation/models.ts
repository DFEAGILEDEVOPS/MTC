export const queueName = 'check-submission'
export type ReconciliationMode = 'preview' | 'cleanup'

export interface ReconciliationItem {
  sequenceNumber: string
  messageId: string
  checkCode?: string
  schoolUUID?: string
  checkedAt?: string | null
  submittedAt?: string | null
  outcome: string
}

export interface ReconciliationRun {
  runId: string
  queueName: string
  mode: ReconciliationMode
  previewRunId: string | null
  requestedBy: string
  status: string
  message: string | null
  deadLetterCountBefore: number | null
  deadLetterCountAfter: number | null
  inventoryCount: number
  checkedCount: number
  removedCount: number
  eligibleCount: number
  retainedCount: number
  failedCount: number
}