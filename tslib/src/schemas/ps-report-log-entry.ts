import moment from 'moment'

export interface IPsReportLogEntry {
  message: string
  source: PsReportSource
  generatedAt: moment.Moment
}

export enum PsReportSource {
  SchoolGenerator = 'School Generator',
  PupilGenerator = 'Pupil Generator',
  Transformer = 'Transformer',
  Writer = 'Writer'
}
