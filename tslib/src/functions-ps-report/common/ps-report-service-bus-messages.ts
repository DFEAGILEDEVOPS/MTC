/**
 * Incoming Azure Service Bus message for ps-report-1-list-schools
 */
export interface PsReportListSchoolsIncomingMessage {
  requestedBy: string
  dateTimeRequested: string
  jobUuid: string
  urns?: number[]
}

/**
 * Incoming Azure Service Bus message for ps-report-2-pupil-data
 */
export interface PsReportSchoolFanOutMessage {
  uuid: string
  name: string
  jobUuid: string
  filename: string
  totalNumberOfSchools: number
}

/**
 * Incoming Azure Service Bus message for ps-report-3b-stage-csv-file
 * Starts the function which is not run on a timer.  Issued at the end of ps-report-2-pupil-data.
 */
export interface PsReportStagingStartMessage {
  startTime: Date
  filename: string
  jobUuid: string
}

/**
 * Incoming Azure Service Bus message for ps-report-4-writer
 */
export interface PsReportStagingCompleteMessage {
  filename: string
  jobUuid: string
}

/**
 * Batched message for ps-report-export queue containing multiple pupil report lines.
 * This batches 50-500 pupils per message to reduce queue message count from 500k to ~1k.
 */
export interface PsReportBatchMessage {
  jobUuid: string
  batch: IPsychometricReportLine[]
  batchNumber: number
  totalBatches: number
  schoolUuid: string
  schoolName: string
}

/**
 * Type import for the report line interface
 */
import type { IPsychometricReportLine } from '../ps-report-2-pupil-data/transformer-models'
