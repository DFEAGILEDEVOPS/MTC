import { IPsReportLogEntry } from '../../schemas/ps-report-log-entry'
import moment from 'moment'
export class PsLogEntryFormatter {
  formatMessage (message: IPsReportLogEntry): string {
    const m = moment(message.generatedAt)
    const formatted = `${m.toISOString()}: [${message.source}] ${message.message}`
    return formatted
  }
}
