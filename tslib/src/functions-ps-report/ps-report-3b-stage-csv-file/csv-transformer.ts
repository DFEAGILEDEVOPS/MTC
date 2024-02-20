import { type IPsychometricReportLine } from '../ps-report-3-transformer/models'
import * as CSV from 'csv-string'
import moment from 'moment'

/**
 * This class outputs strings of csv data from an array of PS Report Lines.  The
 * data is in a format suitable for bulk upload into the mtc_results.pschometricReport_YYYYMMDD_HH_MM table.
 */
export class CsvTransformer {
  private readonly psReportLineData: IPsychometricReportLine[]

  constructor (psReportLineData: IPsychometricReportLine[]) {
    this.psReportLineData = psReportLineData
  }

  private transformLine (d: IPsychometricReportLine): any[] {
    const data = [
      d.PupilDatabaseId,
      d.PupilUPN,
      moment().toISOString(), // createdAt
      moment().toISOString(), // updatedAt
      d.DOB?.format('YYYY-MM-DD'),
      d.Gender,
      d.Forename,
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
      d.ImportedFromCensus ? 1 : 0
    ]
    return data
  }

  public transform (): string {
    const data: any[] = this.psReportLineData.map(this.transformLine)
    return CSV.stringify(data)
  }
}
