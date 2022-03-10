import moment from 'moment'

export interface IPsReportLogEntry {
  message: string
  source: PsReportSource
  generatedAt: moment.Moment
}

export type PsReportSource = 'school-generator' | 'pupil-generator' | 'transformer' | 'writer'
