import moment from 'moment'
import { TYPES } from '../../data-access/sql.service'
const sqlService = require('../../data-access/sql.service')

export interface IJobData {
  urlSlug: string
  createdAt: moment.Moment
  status: string
  type: string
}

export interface IJobOutput {
  output: string
  errorInfo: string
}

export interface IJobInfo {
  jobId: number
  jobUuid: string
}

export class JobDataService {
  public static async getJobs (): Promise<IJobData[]> {
    const sql = `
      SELECT j.urlSlug, j.createdAt, s.[description] as [status],
        t.[description] as [type]
      FROM mtc_admin.job j
      INNER JOIN mtc_admin.jobStatus s ON s.id = j.jobStatus_id
      INNER JOIN mtc_admin.jobType t ON t.id = j.jobType_id
      ORDER BY j.id DESC`
    const data = await sqlService.readonlyQuery(sql)
    if (!Array.isArray(data)) {
      return []
    }

    return data.map(d => {
      return {
        urlSlug: d.urlSlug,
        createdAt: d.createdAt,
        status: d.status,
        type: d.type
      }
    })
  }

  public static async getJobOutput (jobSlug: string): Promise<IJobOutput | undefined> {
    const sql = `
      SELECT j.jobOutput, j.errorOutput
      FROM mtc_admin.job j
      WHERE j.urlSlug = @jobSlug`
    const params = [
      {
        name: 'jobSlug',
        type: TYPES.UniqueIdentifier,
        value: jobSlug
      }
    ]
    const data = await sqlService.readonlyQuery(sql, params)
    if (!Array.isArray(data)) {
      return undefined
    }

    const record = data[0]
    return {
      errorInfo: record.errorOutput,
      output: record.jobOutput
    }
  }

  public static async createJob (jobInput: string, job) {
    const sql = `
                  DECLARE @jobType_id int
                  DECLARE @jobStatus_id int
                  SELECT @jobType_id = id FROM mtc_admin.jobType WHERE jobTypeCode = @jobTypeCode
                  INSERT INTO mtc_admin.job (jobInput, jobType_id, jobStatus_id)
                  OUTPUT inserted.id, inserted.urlSlug
                  VALUES (
                    @jobInput,
                    @jobType_id,
                    @jobStatus_id)`
    const params = [
      {
        name: 'jobInput',
        value: jobInfo.jobInput,
        type: TYPES.NVarChar
      },
      {
        name: 'jobType_id',
        value: jobInfo.jobType_id,
        type: TYPES.Int
      },
      {
        name: 'jobStatus_id',
        value: jobInfo.jobStatus_id,
        type: TYPES.Int
      }
    ]
    const result = await sqlService.query(sql, params)
    return R.head(result)
  }
}
