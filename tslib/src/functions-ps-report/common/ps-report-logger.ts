import moment from 'moment'
import { IContextLike } from '../../common/ContextLike'
import { IPsReportLogEntry, PsReportLogLevel, PsReportSource } from './ps-report-log-entry'

const queueName = 'ps-report-log'

export class PsReportLogClient {
  async log (message: string, source: PsReportSource, context: IContextLike): Promise<void> {
    const entry: IPsReportLogEntry = {
      generatedAt: moment(),
      message: message,
      source: source,
      level: PsReportLogLevel.Info
    }
    if (context.bindings[queueName] === undefined) {
      context.bindings[queueName] = []
    }
    context.bindings[queueName].push(entry)
  }
}
