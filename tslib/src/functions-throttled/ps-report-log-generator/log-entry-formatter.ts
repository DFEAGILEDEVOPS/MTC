import { IPsReportLogEntry } from '../../schemas/ps-report-log-entry'

export class PsLogEntryFormatter {
  formatMessage (message: IPsReportLogEntry): string {
    return `${message.generatedAt.toISOString()}: [${message.source}] ${message.message}`
  }
}
