import * as mssql from 'mssql'
import { ILogger } from '../../../common/logger'
import { ISqlParameter } from '../../../sql/sql.service'
import { SchoolImportJobOutput } from '../SchoolImportJobOutput'
import { ISchoolRecord } from './ISchoolRecord'

export interface ISchoolDataService {
  bulkUpload (schoolData: ISchoolRecord[]): Promise<SchoolImportJobOutput>
}

export class SchoolDataService implements ISchoolDataService {
  private readonly logger: ILogger
  private readonly pool: mssql.ConnectionPool
  private readonly jobResult: SchoolImportJobOutput

  constructor (logger: ILogger, pool: mssql.ConnectionPool, jobResult: SchoolImportJobOutput) {
    this.logger = logger
    this.pool = pool
    this.jobResult = jobResult
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

  async resilientUpload (schoolData: ISchoolRecord[]): Promise<SchoolImportJobOutput> {
    const sql = `INSERT [mtc_admin].[school] (dfeNumber, estabCode, leaCode, name, urn)
                  VALUES (@dfeNumber, @estabCode, @leaCode, @name, @urn)`
    const request = new mssql.Request(this.pool)
    for (let index = 0; index < schoolData.length; index++) {
      const school = schoolData[index]
      request.input('dfeNumber', mssql.TYPES.Int, `${school.leaCode}${school.estabCode}`)
      request.input('estabCode', mssql.TYPES.Int, school.estabCode)
      request.input('leaCode', mssql.TYPES.Int, school.leaCode)
      request.input('name', mssql.TYPES.NVarChar(mssql.MAX), school.name)
      request.input('urn', mssql.TYPES.Int, school.urn)
      try {
        await request.execute(sql)
        this.logger.info(`school imported. urn:${school.urn}`)
        this.jobResult.linesProcessed += 1
        this.jobResult.schoolsLoaded += 1
      } catch (error) {
        this.logError(`insert failed for school. urn:${school.urn} error: ${error.message}`)
        this.jobResult.linesProcessed += 1
      }
    }
    return this.jobResult
  }
}
