import { IPsReportLogEntry } from '../../schemas/ps-report-log-entry'
import { IServiceBusMessageLike } from './log.service'

export class PsLogMessageParser {
  parse (messages: IServiceBusMessageLike[]): IPsReportLogEntry[] {
    return messages.map(m => {
      const entry: IPsReportLogEntry = JSON.parse(m.body)
      return entry
    })
  }
}
