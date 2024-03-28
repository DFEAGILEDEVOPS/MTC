import { TYPES, MAX } from 'mssql'
import { type IModifyResult, type ISqlParameter, type ISqlService, SqlService } from '../../sql/sql.service'
import { JobStatusCode } from '../../common/job-status-code'
import moment from 'moment'
import { isArray } from 'ramda-adjunct'
import { type ILogger } from '../../common/logger'

export type JobStatusOutcomes = (JobStatusCode.Failed | JobStatusCode.CompletedWithErrors | JobStatusCode.CompletedSuccessfully)

export interface JobOutcomeDetails {
  output?: string
  errorInfo?: string
}
export interface IJobDataService {
  setJobStarted (jobSlug: string, options?: { meta?: object }): Promise<IModifyResult>
  setJobComplete (jobSlug: string, jobStatus: JobStatusOutcomes, jobOutput?: string, errorInfo?: string): Promise<IModifyResult>
  getJobId (jobSlug: string): Promise<number | undefined>
}

export class JobDataService implements IJobDataService {
  private readonly sqlService: ISqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  async setJobStarted (jobSlug: string, options?: { meta?: object }, logger?: ILogger): Promise<IModifyResult> {
    const params: ISqlParameter[] = [
      {
        name: 'startedAt',
        type: TYPES.DateTimeOffset,
        value: moment().toISOString()
      },
      {
        name: 'urlSlug',
        type: TYPES.UniqueIdentifier,
        value: jobSlug
      },
      {
        name: 'jobStatusCode',
        type: TYPES.Char(3),
        value: JobStatusCode.Processing
      }
    ]

    const updateFields = [
      'startedAt = @startedAt',
      'jobStatus_id = (SELECT id FROM [mtc_admin].[jobStatus] WHERE jobStatusCode = @jobStatusCode)'
    ]

    if (options !== undefined && Object.hasOwn(options, 'meta')) {
      updateFields.push('meta = @meta')
      params.push({
        name: 'meta',
        type: TYPES.NVarChar(128),
        value: JSON.stringify(options.meta)
      })
    }

    const sql = `UPDATE
                  mtc_admin.[job]
                 SET
                  ${updateFields.join(',\n')}
                WHERE urlSlug = @urlSlug`
    return this.sqlService.modify(sql, params)
  }

  async setJobComplete (jobSlug: string, jobStatusCode: JobStatusOutcomes, jobOutput?: string, errorInfo?: string): Promise<IModifyResult> {
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
    const sql = `UPDATE mtc_admin.[job] SET
                    completedAt = GETUTCDATE(),
                    jobStatus_id = (SELECT id FROM [mtc_admin].[jobStatus] WHERE jobStatusCode = @jobStatusCode),
                    jobOutput = @jobOutput,
                    errorOutput = @errorOutput
                  WHERE urlSlug = @urlSlug`
    return this.sqlService.modify(sql, params)
  }

  async getJobId (jobSlug: string): Promise<number | undefined> {
    const sql = 'SELECT id FROM [mtc_admin].[job] WHERE urlSlug = @urlSlug'
    const params: ISqlParameter[] = [{
      name: 'urlSlug',
      type: TYPES.UniqueIdentifier,
      value: jobSlug
    }]
    const result = await this.sqlService.query(sql, params)
    if (result === undefined) return undefined
    if (!isArray(result)) return undefined
    if (result.length === 0) return undefined
    return result[0].id
  }
}
