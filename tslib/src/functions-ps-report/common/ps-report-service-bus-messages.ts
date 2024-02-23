/**
 * Incoming Azure Service Bus message for ps-report-1-list-schools
 */
export interface PsReportListSchoolsIncomingMessage {
  requestedBy: string
  dateTimeRequested: string
  jobUuid: string
}

/**
 * Incoming Azure Service Bus message for ps-report-2-pupil-data
 */
export interface PsReportSchoolFanOutMessage {
  uuid: string
  name: string
  jobUuid: string
  filename: string
}

/**
 * Incoming Azure Service Bus message for ps-report-3b-stage-csv-file
 * Starts the function which is not run on a timer.  Issued at the end of ps-report-2-pupil-data.
 */
export interface PsReportStagingStartMessage {
  totalNumberOfPupils: number
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
