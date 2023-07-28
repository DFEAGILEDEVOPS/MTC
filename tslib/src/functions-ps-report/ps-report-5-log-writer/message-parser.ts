import { type IPsReportLogEntry } from '../common/ps-report-log-entry'
import { type IServiceBusMessageLike } from './service-bus-message-like'

export class PsLogMessageParser {
  parse (messages: IServiceBusMessageLike[]): IPsReportLogEntry[] {
    return messages.map(m => {
      const entry: IPsReportLogEntry = m.body
      return entry
    })
  }
}
