import { TYPES, MAX } from 'mssql'
import { ISqlParameter, ISqlService, SqlService } from '../../sql/sql.service'
import * as R from 'ramda'
import { JobStatusCode } from '../../common/job-status-code'
import moment from 'moment'

export type JobStatusOutcomes = (JobStatusCode.FLD | JobStatusCode.CWR | JobStatusCode.COM)

export interface JobOutcomeDetails {
  output?: string
  errorInfo?: string
}
export interface IJobDataService {
  setJobStarted (jobSlug: string): Promise<number>
  setJobComplete (jobSlug: string, jobStatus: JobStatusOutcomes, jobOutput?: string, errorInfo?: string): Promise<void>
}

export class JobDataService implements IJobDataService {
  private readonly sqlService: ISqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  async setJobStarted (jobSlug: string): Promise<number> {
    const params: ISqlParameter[] = [
      {
        name: '@startedAt',
        type: TYPES.DateTimeOffset,
        value: moment().toISOString()
      }, {
        name: '@urlSlug',
        type: TYPES.UniqueIdentifier,
        value: jobSlug
      },
      {
        name: 'jobStatusCode',
        type: TYPES.Char(3),
        value: JobStatusCode.PRC
      }]
    const sql = `UPDATE mtc_admin.[job] SET
                  startedAt=@startedAt,
                  jobStatus_id = (SELECT id FROM [mtc_admin].[jobStatus] WHERE jobStatusCode = @jobStatusCode)
                WHERE urlSlug=@urlSlug;
                SELECT id FROM [mtc_admin].[job]
                WHERE urlSlug = @urlSlug;`
    const result = await this.sqlService.modify(sql, params)
    const recordset: any = R.path(['recordset'], result)
    return R.path(['id'], R.head(recordset)) as number
  }

  async setJobComplete (jobSlug: string, jobStatusCode: JobStatusOutcomes, jobOutput?: string, errorInfo?: string): Promise<void> {
    const params: ISqlParameter[] = [
      {
        name: 'urlSlug',
        type: TYPES.UniqueIdentifier,
        value: jobSlug
      },
      {
        name: 'jobStatusCode',
        type: TYPES.Char(3),
        value: jobStatusCode
      },
      {
        name: 'jobOutput',
        type: TYPES.NVarChar(MAX),
        value: jobOutput
      },
      {
        name: 'errorOutput',
        type: TYPES.NVarChar(MAX),
        value: errorInfo
      }]
    const sql = `'UPDATE mtc_admin.[job] SET
                    completedAt = GETUTCDATE(),
                    jobStatus_id = (SELECT id FROM [mtc_admin].[jobStatus] WHERE jobStatusCode = @jobStatusCode),
                    jobOutput = @jobOutput,
                    errorOutput = @errorOutput
                  WHERE urlSlug=@urlSlug'`
    return this.sqlService.modify(sql, params)
  }
}
