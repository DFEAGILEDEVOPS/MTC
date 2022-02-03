import * as mssql from 'mssql'
import { ILogger } from '../../../common/logger'
import { IJobOutput, SchoolImportJobOutput } from '../SchoolImportJobOutput'
import { ISchoolRecord } from './ISchoolRecord'
import { ISqlService, SqlService } from '../../../sql/sql.service'
const name = 'school-import'

export interface ISchoolDataService {
  getJobId (): Promise<number | undefined>
  updateJobStatus (jobId: number, jobStatusCode: string): Promise<any>
  updateJobStatusWithResult (jobId: number, jobStatusCode: string, jobResult: IJobOutput): Promise<any>
  updateJobStatusWithResultAndError (jobId: number, jobStatusCode: string, jobResult: IJobOutput, error: Error): Promise<any>
  bulkUpload (schoolData: ISchoolRecord[]): Promise<SchoolImportJobOutput>
}

export class SchoolDataService implements ISchoolDataService {
  private readonly logger: ILogger
  private readonly pool: mssql.ConnectionPool
  private readonly jobResult: SchoolImportJobOutput
  private readonly sqlService: ISqlService

  constructor (logger: ILogger, pool: mssql.ConnectionPool, jobResult: SchoolImportJobOutput, sqlService?: ISqlService) {
    this.logger = logger
    this.pool = pool
    this.jobResult = jobResult
    this.sqlService = sqlService ?? new SqlService()
  }

  private logError (msg: string): void {
    this.jobResult.stderr.push(`${(new Date()).toISOString()} school-import: ${msg}`)
  }

  /**
   * Perform a bulk upload to the school table, inserting new schools
   * @param context - function context object
   * @param schoolData - the csv parsed to array or arrays without header row
   * @param mapping - the mapping between our domain and the input file
   * @return {SchoolImportJobOutput}
   */
  async bulkUpload (schoolData: ISchoolRecord[]): Promise<SchoolImportJobOutput> {
    this.logger.verbose('SchoolDataService.bulkUpload() called')

    const table = new mssql.Table('[mtc_admin].[school]')
    table.create = false
    table.columns.add('dfeNumber', mssql.Int, { nullable: false })
    table.columns.add('estabCode', mssql.Int, { nullable: false })
    table.columns.add('leaCode', mssql.Int, { nullable: false })
    table.columns.add('name', mssql.NVarChar(mssql.MAX), { nullable: false })
    table.columns.add('urn', mssql.Int, { nullable: false })

    for (let i = 0; i < schoolData.length; i++) {
      const school = schoolData[i]
      this.jobResult.linesProcessed += 1
      this.jobResult.schoolsLoaded += 1
      const dfeNumber = `${school.leaCode}${school.estabCode}`
      if (dfeNumber.toString().length !== 7) {
        this.logError(`WARN: school [${school.urn}] has an unusual dfeNumber [${dfeNumber}]`)
      }
      table.rows.add(dfeNumber, school.estabCode, school.leaCode, school.name, school.urn)
    }
    const request = new mssql.Request(this.pool)
    if (this.jobResult.schoolsLoaded > 0) {
      try {
        const res = await request.bulk(table)
        this.logger.info('bulk request complete: ', res)
      } catch (error) {
        this.logError(`Bulk request failed. Error was:\n ${error.message}`)
        error.jobResult = this.jobResult
        throw error
      }
    }
    return this.jobResult
  }

  async getJobId (): Promise<number | undefined> {
    this.logger.verbose(`${name}: getJobId() called`)
    const sql = `SELECT j.id
                   FROM mtc_admin.job j
                        JOIN mtc_admin.jobStatus js ON (j.jobStatus_id = js.id)
                        JOIN mtc_admin.jobType jt ON (j.jobType_id = jt.id)
                  WHERE jt.jobTypeCode = 'ORG'
                    AND js.jobStatusCode = 'SUB'`
    const res = await this.sqlService.query(sql)
    if (res !== undefined && Array.isArray(res)) {
      const id = res[0].id
      this.logger.verbose(`${name}: getJobId() returning ${id}`)
      return id
    }
    return undefined
  }

  async updateJobStatus (jobId: number, code: string): Promise<any> {
    const sql = `UPDATE mtc_admin.job
                    SET jobStatus_id = (SELECT id from mtc_admin.jobStatus WHERE jobStatusCode = @code)
                  WHERE id = @id`
    const params = [
      { name: 'code', value: code, type: mssql.TYPES.Char(3) },
      { name: 'id', value: jobId, type: mssql.TYPES.Int }
    ]
    return this.sqlService.query(sql, params)
  }

  async updateJobStatusWithResult (jobId: Number, code: String, jobOutput: IJobOutput): Promise<any> {
    const sql = `UPDATE mtc_admin.job
                    SET jobStatus_id = (SELECT id from mtc_admin.jobStatus WHERE jobStatusCode = @code),
                        jobOutput = @jobOutput
                  WHERE id = @id`
    const params = [
      { name: 'code', value: code, type: mssql.TYPES.Char(3) },
      { name: 'id', value: jobId, type: mssql.TYPES.Int },
      { name: 'jobOutput', value: JSON.stringify(jobOutput), type: mssql.TYPES.NVarChar(mssql.MAX) }
    ]
    return this.sqlService.query(sql, params)
  }

  async updateJobStatusWithResultAndError (jobId: Number, code: String, jobOutput: IJobOutput, error: Error): Promise<any> {
    const sql = `UPDATE mtc_admin.job
                    SET jobStatus_id = (SELECT id from mtc_admin.jobStatus WHERE jobStatusCode = @code),
                        jobOutput = @jobOutput,
                        errorOutput = @error
                  WHERE id = @id`
    const params = [
      { name: 'code', value: code, type: mssql.TYPES.Char(3) },
      { name: 'id', value: jobId, type: mssql.TYPES.Int },
      { name: 'jobOutput', value: JSON.stringify(jobOutput), type: mssql.TYPES.NVarChar(mssql.MAX) },
      { name: 'error', value: error.message, type: mssql.TYPES.NVarChar(mssql.MAX) }
    ]
    return this.sqlService.query(sql, params)
  }
}
