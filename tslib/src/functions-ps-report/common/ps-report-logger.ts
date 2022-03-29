import moment from 'moment'
import { IContextLike } from '../../common/ContextLike'
import { PsLogEntryFormatter } from '../ps-report-5-log-writer/log-entry-formatter'
import { IPsReportLogEntry, PsReportLogLevel, PsReportSource } from './ps-report-log-entry'

const formatter = new PsLogEntryFormatter()

export interface IPsReportLogger {
  info (message: string): void
  verbose (message: string): void
  warn (message: string): void
  error (message: string): void
}

export class PsReportLogger {
  private readonly context: IContextLike
  private readonly source: PsReportSource

  constructor (context: IContextLike, sourceFunction: PsReportSource) {
    this.context = context
    this.source = sourceFunction
  }

  private log (message: string, level: PsReportLogLevel): string {
    const entry: IPsReportLogEntry = {
      generatedAt: moment(),
      message: message,
      source: this.source,
      level: level
    }
    if (this.context.bindings.logs === undefined) {
      this.context.bindings.logs = []
    }
    this.context.bindings.logs.push(entry)
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
