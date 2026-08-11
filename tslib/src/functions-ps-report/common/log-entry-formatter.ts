import { type IPsReportLogEntry } from './ps-report-log-entry.js'
import moment from 'moment'
export class PsLogEntryFormatter {
  formatEntry (message: IPsReportLogEntry): string {
    const m = moment(message.generatedAt)
    const formatted = `${m.toISOString()}: [${message.source}] ${message.level} ${message.invocationId} - ${message.message}`
    return formatted
  }
}
