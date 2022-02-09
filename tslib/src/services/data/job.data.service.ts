import { TYPES, MAX } from 'mssql'
import { ISqlParameter, ISqlService, SqlService } from '../../sql/sql.service'
import * as R from 'ramda'

export enum JobStatusCode {
  SUB = 'SUB',
  PRC = 'PRC',
  COM = 'COM',
  CWR = 'CWR',
  FLD = 'FLD',
  DEL = 'DEL'
}

export type JobStatusOutcomes = (JobStatusCode.FLD | JobStatusCode.CWR | JobStatusCode.COM)

export interface JobOutcomeDetails {
  output?: string
  errorInfo?: string
}
export interface IJobDataService {
  setJobStarted (jobSlug: string): Promise<number>
  setJobComplete (jobSlug: string, jobStatus: JobStatusOutcomes, details?: JobOutcomeDetails): Promise<void>
}

export class JobDataService implements IJobDataService {
  private readonly sqlService: ISqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  async setJobStarted (jobSlug: string): Promise<number> {
    const params = new Array<ISqlParameter>()
    params.push({
      name: '@startedAt',
      type: TYPES.DateTimeOffset,
      value: Date.now
    })
    params.push({
      name: '@id',
      type: TYPES.UniqueIdentifier,
      value: jobSlug
    })
    const result = await this.sqlService.modify(`UPDATE mtc_admin.[job] SET startedAt=@startedAt
                                    WHERE id=@id;
                                  SELECT id FROM [mtc_admin].[job]
                                    WHERE urlSlug = @urlSlug;`, params)
    const recordset: any = R.path(['recordset'], result)
    return R.path(['id'], R.head(recordset)) as number
  }

  async setJobComplete (jobSlug: string, jobStatusCode: JobStatusOutcomes, details?: JobOutcomeDetails): Promise<void> {
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
        value: details?.output
      },
      {
        name: 'errorOutput',
        type: TYPES.NVarChar(MAX),
        value: details?.errorInfo
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
