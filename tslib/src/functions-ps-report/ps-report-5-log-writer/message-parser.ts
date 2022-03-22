import { ServiceBusReceivedMessage } from '@azure/service-bus'
import { IPsReportLogEntry } from '../../schemas/ps-report-log-entry'

export class ServiceBusMessageParser {
  parse (messages: ServiceBusReceivedMessage[]): IPsReportLogEntry[] {
    return messages.map(m => {
      const entry: IPsReportLogEntry = JSON.parse(m.body)
      return entry
    })
  }
}
