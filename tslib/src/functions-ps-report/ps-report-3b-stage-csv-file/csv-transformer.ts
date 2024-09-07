import type { IReportLineAnswer, IPsychometricReportLine } from '../ps-report-2-pupil-data/transformer-models'
import * as CSV from 'csv-string'
import moment from 'moment'
import { type ILogger } from '../../common/logger'

export interface CsvData {
  PupilDatabaseId: number
  PupilUPN: string
  createdAt: string
  updatedAt: string
  DOB: string
  Gender: string
  Forename: string
  MiddleNames: string | null
  Surname: string
  FormMark: number | null
  QDisplayTime: number | null
  PauseLength: number | null
  AccessArr: string | null
  RestartReason: string | null
  RestartNumber: number | null
  PupilStatus: string | null
  DeviceID: string | null
  BrowserType: string | null
  SchoolName: string | null
  Estab: number
  SchoolURN: number
  LAnum: number
  AttemptID: string | null
  FormID: string | null
  TestDate: string | null
  TimeStart: string | null
  TimeComplete: string | null
  TimeTaken: number | null
  ReasonNotTakingCheck: string | null
  ToECode: number
  ImportedFromCensus: number
  IsEdited: number
}

/**
 * CsvTransformer
 *
 * This class outputs strings of csv data from an array of PS Report Lines.  The
 * data is in a format suitable for bulk upload into the mtc_results.pschometricReport_YYYYMMDD_HH_MM table.
 */
export class CsvTransformer {
  private readonly psReportLineData: IPsychometricReportLine[]
  private readonly logger: ILogger

  constructor (logger: ILogger, psReportLineData: IPsychometricReportLine[]) {
    this.logger = logger
    this.psReportLineData = psReportLineData
    // If I remove this call to the logger the linter insists the logge is not used, but the
    // next developer on this file will certainly be glad to have logging, so this next construction
    // is weird.
    // eslint-disable-next-line no-constant-condition
    if (false) {
      // @ts-ignore: Unreachable code error
      this.logger.verbose('CsvTransformer initialised')
    }
  }

  private transformAnswer (a: IReportLineAnswer | undefined): any[] {
    if (a === undefined) {
      return Array.from(Array(14)).fill(null)
    }
    const data = [
      a.id,
      a.response,
      a.inputMethods,
      a.keystrokes,
      a.score,
      a.responseTime,
      a.timeout === true ? 1 : 0, // convert boolean for sql server bit field
      a.timeoutResponse === true ? 1 : 0, // convert boolean for sql server bit field
      a.timeoutScore === true ? 1 : 0,
      a.loadTime?.toISOString(),
      a.firstKey?.toISOString(),
      a.lastKey?.toISOString(),
      a.overallTime,
      a.recallTime
    ]
    return data
  }

  private transformLine (d: IPsychometricReportLine): any[] {
    const createdAt = moment()
    const updatedAt = createdAt.clone()
    const data = [
      d.PupilDatabaseId,
      d.PupilUPN,
      createdAt.toISOString(),
      updatedAt.toISOString(),
      d.DOB?.format('YYYY-MM-DD'),
      d.Gender,
      d.Forename,
      d.MiddleNames,
      d.Surname,
      d.FormMark,
      d.QDisplayTime,
      d.PauseLength,
      d.AccessArr,
      d.RestartReason,
      d.RestartNumber,
      d.PupilStatus,
      d.DeviceID,
      d.BrowserType,
      d.SchoolName,
      d.Estab,
      d.SchoolURN,
      d.LAnum,
      d.AttemptID,
      d.FormID,
      d.TestDate?.format('YYYY-MM-DD'),
      d.TimeStart?.toISOString(),
      d.TimeComplete?.toISOString(),
      d.TimeTaken,
      d.ReasonNotTakingCheck,
      d.ToECode,
      d.ImportedFromCensus ? 1 : 0,
      d.IsEdited ? 1 : 0
    ]

    const answers: any[] = []
    // We need 25 answers, even if they are null
    for (let i = 0; i < 25; i++) {
      answers[i] = this.transformAnswer(d.answers[i])
    }

    // flatten the answers array and add it to data.
    answers.forEach(ans => {
      ans.forEach((datum: any) => data.push(datum))
    })
    return data
  }

  public transform (): string {
    const data: any[] = this.psReportLineData.map(this.transformLine, this)
    return CSV.stringify(data)
  }
}
