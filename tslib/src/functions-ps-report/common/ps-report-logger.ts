import moment from 'moment'
import { type IContextLike } from '../../common/ContextLike'
import { type ILogger } from '../../common/logger'
import { PsLogEntryFormatter } from './log-entry-formatter'
import { type IPsReportLogEntry, type PsReportLogLevel, type PsReportSource } from './ps-report-log-entry'

const formatter = new PsLogEntryFormatter()

export class PsReportLogger implements ILogger {
  private readonly context: IContextLike
  private readonly source: PsReportSource

  constructor (context: IContextLike, sourceFunction: PsReportSource) {
    this.context = context
    this.source = sourceFunction
  }

  private log (message: string, level: PsReportLogLevel): string {
    const entry: IPsReportLogEntry = {
      generatedAt: moment(),
      message,
      source: this.source,
      level,
      invocationId: this.context.invocationId
    }
    return formatter.formatEntry(entry)
  }

  info (message: string): void {
    const formatted = this.log(message, 'info')
    this.context.info(formatted)
  }

  trace (message: string): void {
    const formatted = this.log(message, 'verbose')
    this.context.trace(formatted)
  }

  warn (message: string): void {
    const formatted = this.log(message, 'warning')
    this.context.warn(formatted)
  }

  error (message: string): void {
    const formatted = this.log(message, 'error')
    this.context.error(formatted)
  }
}
