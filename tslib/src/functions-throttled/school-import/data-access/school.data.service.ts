import * as mssql from 'mssql'
import { ILogger } from '../../../common/logger'
import { SchoolImportJobResult } from '../SchoolImportJobResult'
import { ISchoolRecord } from './ISchoolRecord'

export interface ISchoolDataService {
  bulkUpload (logger: ILogger, data: any, jobResult: SchoolImportJobResult): Promise<SchoolImportJobResult>
}

export class SchoolDataService implements ISchoolDataService {

  private pool: mssql.ConnectionPool
  private jobResult: SchoolImportJobResult

  constructor (pool: mssql.ConnectionPool, jobResult: SchoolImportJobResult) {
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
   * @return {SchoolImportJobResult}
   */
  async bulkUpload (logger: ILogger, schoolData: Array<ISchoolRecord>): Promise<SchoolImportJobResult> {
    logger.verbose('SchoolDataService.bulkUpload() called')

    const table = new mssql.Table('[mtc_admin].[school]')
    table.create = false
    table.columns.add('dfeNumber', mssql.Int, { nullable: false })
    table.columns.add('estabCode', mssql.NVarChar(mssql.MAX), { nullable: true })
    table.columns.add('leaCode', mssql.Int, { nullable: true })
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
        logger.info(`bulk request complete: `, res)
      } catch (error) {
        this.logError(`Bulk request failed. Error was:\n ${error.message}`)
        error.jobResult = this.jobResult
        throw error
      }
    }
    return this.jobResult
  }
}
