import moment from 'moment'
import { isNumber } from 'ramda-adjunct'

const sqlService = require('../../data-access/sql.service')

export interface IJobData {
  jobId: number
  createdAt: moment.Moment
  status: string
  type: string
}

export interface IJobOutput {
  output: string
  errorInfo: string
}

export class JobDataService {
  public static async getJobs (): Promise<IJobData[]> {
    const sql = `
      SELECT j.id, j.createdAt, s.[description] as [status],
        t.[description] as [type]
      FROM mtc_admin.job j
      INNER JOIN mtc_admin.jobStatus s ON s.id = j.jobStatus_id
      INNER JOIN mtc_admin.jobType t ON t.id = j.jobType_id`
    const data = await sqlService.readonlyQuery(sql)
    if (!Array.isArray(data)) {
      return []
    }

    return data.map(d => {
      return {
        jobId: d.id,
        createdAt: d.createdAt,
        status: d.status,
        type: d.type
      }
    })
  }

  public static async getJobOutput (jobId: number): Promise<IJobOutput> {
    const sql = `
      SELECT j.jobOutput, j.errorOutput
      FROM mtc_admin.job j
      WHERE j.id = @jobId`
      const data = await sqlService.readonlyQuery(sql)
      if (!Array.isArray(data)) {
        return undefined
      }

      const record = data[0]
      return {
        errorInfo: record.errorOutput,
        output: record.jobOutput
      }
  }
}
