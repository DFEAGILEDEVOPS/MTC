
import { Context } from '@azure/functions'
import * as mssql from 'mssql'
import { SchoolImportPredicates } from './predicates'

export interface ISchoolImportJobResult {
  stdout: Array<string>,
  stderr: Array<string>,
  schoolsLoaded: number,
  linesProcessed: number
}

export class SchoolDataService {

  private predicates: SchoolImportPredicates

  private jobResult: ISchoolImportJobResult

  constructor () {
    this.predicates = new SchoolImportPredicates()
  }

  private log (msg: string) {
    this.jobResult.stdout.push(`${(new Date()).toISOString()} school-import: ${msg}`)

  }

  private logError (msg: string) {
    this.jobResult.stderr.push(`${(new Date()).toISOString()} school-import: ${msg}`)
  }

  /**
   * Return a domain-mapped object from a
   * @param {Array} row - csv row as array ['1001', 'Sometown Primary school', 'csv', 'array', ... ]
   * @param {Object} mapping - mapping object { urn: 0, name: 1, ... }
   * @return {Object} - mapped object of string values E.g. { urn: '1001', 'name': 'Sometown Primary School' ... }
   */
  getMappedData (row: any, mapping: any) {
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
  isPredicated (school: any) {
    const targetAge = 9
    return predicates.isSchoolOpen(this.log, school) &&
      predicates.isRequiredEstablishmentTypeGroup(this.log, school) &&
      predicates.isAgeInRange(this.log, targetAge, school)
  }

  /**
   * Perform a bulk upload to the school table, inserting new schools
   * @param context - function context object
   * @param data - the csv parsed to array or arrays without header row
   * @param mapping - the mapping between our domain and the input file
   * @return {Promise<{linesProcessed: number, schoolsLoaded: number}>}
   */
  async bulkUpload (context: Context, data: any, mapping: any) {
    context.log.verbose(`${name}.school.data.service.bulkUpload() called`)
    this.jobResult = {
      stderr: [],
      stdout: [],
      schoolsLoaded: 0,
      linesProcessed: 0
    }

    const table = new mssql.Table('[mtc_admin].[school]')
    table.create = false
    table.columns.add('dfeNumber', mssql.Int, { nullable: false })
    table.columns.add('estabCode', mssql.NVarChar(mssql.MAX), { nullable: true })
    table.columns.add('leaCode', mssql.Int, { nullable: true })
    table.columns.add('name', mssql.NVarChar(mssql.MAX), { nullable: false })
    table.columns.add('urn', mssql.Int, { nullable: false })

    for (let i = 0; i < data.length; i++) {
      const mapped = this.getMappedData(data[i], mapping)
      this.jobResult.linesProcessed += 1

      if (this.isPredicated(mapped)) {
        this.jobResult.schoolsLoaded += 1
        const dfeNumber = parseInt('' + mapped.leaCode + mapped.estabCode, 10)
        if (dfeNumber.toString().length !== 7) {
          this.logError(`WARN: ${name} school [${mapped.urn}] has an unusual dfeNumber [${dfeNumber}]`)
        }
        table.rows.add(dfeNumber, mapped.estabCode, parseInt(mapped.leaCode, 10), mapped.name, parseInt(mapped.urn, 10))
      }
    }
    context.log.verbose(`${name} data rows added for bulk upload`)
    const request = new mssql.Request(pool)
    context.log.verbose(`${name} new request obj created`)
    if (this.jobResult.schoolsLoaded > 0) {
      try {
        const res = await request.bulk(table)
        context.log(`${name} bulk request complete: `, res)
      } catch (error) {
        this.logError(`Bulk request failed. Error was:\n ${error.message}`)
        error.jobResult = this.jobResult
        throw error
      }
    }
    return this.jobResult
  }

}
