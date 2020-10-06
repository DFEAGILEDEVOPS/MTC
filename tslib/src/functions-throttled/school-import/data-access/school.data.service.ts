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
   * @param data - the csv parsed to array or arrays without header row
   * @param mapping - the mapping between our domain and the input file
   * @return {SchoolImportJobResult}
   */
  async bulkUpload (logger: ILogger, data: Array<ISchoolRecord>): Promise<SchoolImportJobResult> {
    logger.verbose(`${name}.school.data.service.bulkUpload() called`)

    const table = new mssql.Table('[mtc_admin].[school]')
    table.create = false
    table.columns.add('dfeNumber', mssql.Int, { nullable: false })
    table.columns.add('estabCode', mssql.NVarChar(mssql.MAX), { nullable: true })
    table.columns.add('leaCode', mssql.Int, { nullable: true })
    table.columns.add('name', mssql.NVarChar(mssql.MAX), { nullable: false })
    table.columns.add('urn', mssql.Int, { nullable: false })

    for (let i = 0; i < data.length; i++) {
      const mapped = data[i]
      this.jobResult.linesProcessed += 1
      this.jobResult.schoolsLoaded += 1
      const dfeNumber = `${mapped.leaCode}${mapped.estabCode}`
      if (dfeNumber.toString().length !== 7) {
        this.logError(`WARN: ${name} school [${mapped.urn}] has an unusual dfeNumber [${dfeNumber}]`)
      }
      table.rows.add(dfeNumber, mapped.estabCode, mapped.leaCode, 10, mapped.name, mapped.urn, 10)
    }
    logger.verbose(`${name} data rows added for bulk upload`)
    const request = new mssql.Request(this.pool)
    logger.verbose(`${name} new request obj created`)
    if (this.jobResult.schoolsLoaded > 0) {
      try {
        const res = await request.bulk(table)
        logger.info(`${name} bulk request complete: `, res)
      } catch (error) {
        this.logError(`Bulk request failed. Error was:\n ${error.message}`)
        // TODO used?
        error.jobResult = this.jobResult
        throw error
      }
    }
    return this.jobResult
  }
}
