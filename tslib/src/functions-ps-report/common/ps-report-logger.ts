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
      level
    }
    return formatter.formatEntry(entry)
  }

  info (message: string): void {
    const formatted = this.log(message, 'info')
    this.context.log.info(formatted)
  }

  verbose (message: string): void {
    const formatted = this.log(message, 'verbose')
    this.context.log.verbose(formatted)
  }

  warn (message: string): void {
    const formatted = this.log(message, 'warning')
    this.context.log.warn(formatted)
  }

  error (message: string): void {
    const formatted = this.log(message, 'error')
    this.context.log.error(formatted)
  }
}
