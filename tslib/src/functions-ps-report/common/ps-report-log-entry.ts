import type moment from 'moment'

export interface IPsReportLogEntry {
  message: string
  level: PsReportLogLevel
  source: PsReportSource
  generatedAt: moment.Moment
  invocationId: string
}

export enum PsReportSource {
  SchoolGenerator = 'ps-report-1-list-schools',
  PupilGenerator = 'ps-report-2-pupil-data',
  Transformer = 'ps-report-3-transformer',
  Writer = 'ps-report-4-writer'
}

export type PsReportLogLevel = 'info' | 'warning' | 'verbose' | 'error'
