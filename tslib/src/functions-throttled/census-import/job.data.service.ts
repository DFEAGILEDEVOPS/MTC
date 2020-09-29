import * as mssql from 'mssql'
import * as R from 'ramda'

export interface IJobDataService {
  updateStatus (pool: mssql.ConnectionPool, urlSlug: string, jobStatusCode: string, jobOutput?: string, errorOutput?: string): Promise<any>
}

export class JobDataService implements IJobDataService {
  /**
   * Update pupil census job status
   * @param {Object} pool
   * @param {String} urlSlug
   * @param {String} jobStatusCode
   * @param {String} jobOutput
   * @param {String} errorOutput
   * @return {Promise}
   */
  async updateStatus (pool: mssql.ConnectionPool, urlSlug: string, jobStatusCode: string, jobOutput?: string, errorOutput?: string): Promise<any> {
    const sql = `UPDATE [mtc_admin].[job] SET jobStatus_id =
    (SELECT id FROM [mtc_admin].[jobStatus] WHERE jobStatusCode = @jobStatusCode),
        jobOutput=@jobOutput, errorOutput=@errorOutput
    WHERE urlSlug = @urlSlug;
    SELECT id
      FROM [mtc_admin].[job]
      WHERE urlSlug = @urlSlug;`
    const request = new mssql.Request(pool)
    request.input('urlSlug', mssql.UniqueIdentifier, urlSlug)
    request.input('jobStatusCode', mssql.Char(3), jobStatusCode)
    request.input('jobOutput', mssql.NVarChar(mssql.MAX), jobOutput)
    request.input('errorOutput', mssql.NVarChar(mssql.MAX), errorOutput)
    const result = await request.query(sql)
    return R.path(['id'], R.head(R.path(['recordset'], result)))
  }
}
