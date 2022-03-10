import { IPsReportLogEntry } from '../../schemas/ps-report-log-entry'
import { PsLogEntryFormatter } from './log-entry-formatter'
export class PsLogGeneratorService {
  private readonly formatter = new PsLogEntryFormatter()
  generate (messages: IPsReportLogEntry[]): string {
    const formatted = messages.map(m => {
      return this.formatter.formatMessage(m)
    })
    return formatted.join('\n')
  }
}
