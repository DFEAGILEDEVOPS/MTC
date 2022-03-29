import moment from 'moment'
import { IContextLike } from '../../common/ContextLike'
import { PsLogEntryFormatter } from '../ps-report-5-log-writer/log-entry-formatter'
import { IPsReportLogEntry, PsReportLogLevel, PsReportSource } from './ps-report-log-entry'

const formatter = new PsLogEntryFormatter()

const queueName = 'ps-report-log'

export interface IPsReportLogger {
  info (message: string, source: PsReportSource, context: IContextLike): void
  verbose (message: string, source: PsReportSource, context: IContextLike): void
  warn (message: string, source: PsReportSource, context: IContextLike): void
  error (message: string, source: PsReportSource, context: IContextLike): void
}

export class PsReportLogger {
  private log (message: string, source: PsReportSource, context: IContextLike, level: PsReportLogLevel): string {
    const entry: IPsReportLogEntry = {
      generatedAt: moment(),
      message: message,
      source: source,
      level: level
    }
    if (context.bindings[queueName] === undefined) {
      context.bindings[queueName] = []
    }
    context.bindings[queueName].push(entry)
    return formatter.formatEntry(entry)
  }

  info (message: string, source: PsReportSource, context: IContextLike): void {
    const formatted = this.log(message, source, context, 'info')
    context.log.info(formatted)
  }

  verbose (message: string, source: PsReportSource, context: IContextLike): void {
    const formatted = this.log(message, source, context, 'verbose')
    context.log.verbose(formatted)
  }

  warn (message: string, source: PsReportSource, context: IContextLike): void {
    const formatted = this.log(message, source, context, 'warning')
    context.log.warn(formatted)
  }

  error (message: string, source: PsReportSource, context: IContextLike): void {
    const formatted = this.log(message, source, context, 'error')
    context.log.error(formatted)
  }
}
