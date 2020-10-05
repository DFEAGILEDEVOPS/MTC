import * as mssql from 'mssql'
import { ILogger } from '../../../common/logger'
import { SchoolImportJobResult } from '../ISchoolImportJobResult'
import { Predicates } from './predicates'

export interface ISchoolDataService {
  getMappedData (row: any, mapping: any): any
  isPredicated (school: any): boolean
  bulkUpload (logger: ILogger, data: any, mapping: any, jobResult: SchoolImportJobResult): Promise<SchoolImportJobResult>
}

export class SchoolDataService implements ISchoolDataService {

  private pool: mssql.ConnectionPool
  private predicates: Predicates

  constructor (pool: mssql.ConnectionPool) {
    this.pool = pool
    this.predicates = new Predicates()
  }

  private log (msg: string, jobResult: SchoolImportJobResult) {
    jobResult.stdout.push(`${(new Date()).toISOString()} school-import: ${msg}`)
  }

  private logError (msg: string, jobResult: SchoolImportJobResult) {
    jobResult.stderr.push(`${(new Date()).toISOString()} school-import: ${msg}`)
  }

  /**
   * Return a domain-mapped object from a
   * @param {Array} row - csv row as array ['1001', 'Sometown Primary school', 'csv', 'array', ... ]
   * @param {Object} mapping - mapping object { urn: 0, name: 1, ... }
   * @return {Object} - mapped object of string values E.g. { urn: '1001', 'name': 'Sometown Primary School' ... }
   */
  getMappedData (row: any, mapping: any): any {
    const o: any = {}
    Object.keys(mapping).forEach(k => {
      o[k] = row[mapping[k]]
    })
    return o
  }

  /**
   * Determine if the record should be loaded
   * @param school - school attributes with our mapped property names
   * @return {boolean}
   */
  isPredicated (school: any): boolean {
    const targetAge = 9
    return this.predicates.isSchoolOpen(this.log, school) &&
      this.predicates.isRequiredEstablishmentTypeGroup(this.log, school) &&
      this.predicates.isAgeInRange(this.log, targetAge, school)
  }

  /**
   * Perform a bulk upload to the school table, inserting new schools
   * @param context - function context object
   * @param data - the csv parsed to array or arrays without header row
   * @param mapping - the mapping between our domain and the input file
   * @return {Promise<{linesProcessed: number, schoolsLoaded: number}>}
   */
  async bulkUpload (logger: ILogger, data: any, mapping: any, jobResult: SchoolImportJobResult): Promise<SchoolImportJobResult> {
    logger.verbose(`${name}.school.data.service.bulkUpload() called`)

    const table = new mssql.Table('[mtc_admin].[school]')
    table.create = false
    table.columns.add('dfeNumber', mssql.Int, { nullable: false })
    table.columns.add('estabCode', mssql.NVarChar(mssql.MAX), { nullable: true })
    table.columns.add('leaCode', mssql.Int, { nullable: true })
    table.columns.add('name', mssql.NVarChar(mssql.MAX), { nullable: false })
    table.columns.add('urn', mssql.Int, { nullable: false })

    for (let i = 0; i < data.length; i++) {
      const mapped = this.getMappedData(data[i], mapping)
      jobResult.linesProcessed += 1

      if (this.isPredicated(mapped)) {
        jobResult.schoolsLoaded += 1
        const dfeNumber = parseInt('' + mapped.leaCode + mapped.estabCode, 10)
        if (dfeNumber.toString().length !== 7) {
          this.logError(`WARN: ${name} school [${mapped.urn}] has an unusual dfeNumber [${dfeNumber}]`, jobResult)
        }
        table.rows.add(dfeNumber, mapped.estabCode, parseInt(mapped.leaCode, 10), mapped.name, parseInt(mapped.urn, 10))
      }
    }
    logger.verbose(`${name} data rows added for bulk upload`)
    const request = new mssql.Request(this.pool)
    logger.verbose(`${name} new request obj created`)
    if (jobResult.schoolsLoaded > 0) {
      try {
        const res = await request.bulk(table)
        logger.info(`${name} bulk request complete: `, res)
      } catch (error) {
        this.logError(`Bulk request failed. Error was:\n ${error.message}`, jobResult)
        error.jobResult = jobResult
        throw error
      }
    }
    return jobResult
  }
}
