import * as mssql from 'mssql'
import * as R from 'ramda'
import { ILogger } from '../../../common/logger'
import { SchoolImportJobOutput } from '../SchoolImportJobOutput'
import { ISchoolRecord } from './ISchoolRecord'

export interface ISchoolDataService {
  bulkUpload (schoolData: ISchoolRecord[]): Promise<SchoolImportJobOutput>
  individualUpload (schoolData: ISchoolRecord[]): Promise<SchoolImportJobOutput>
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

  private logInfo (msg: string): void {
    this.jobResult.stdout.push(`${(new Date()).toISOString()} school-import: ${msg}`)
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
    table.columns.add('typeOfEstablishmentLookup_id', mssql.Int, { nullable: true })

    for (let i = 0; i < schoolData.length; i++) {
      const school = schoolData[i]
      this.jobResult.linesProcessed += 1
      this.jobResult.schoolsLoaded += 1
      const dfeNumber = `${school.leaCode}${school.estabCode}`
      if (dfeNumber.toString().length !== 7) {
        this.logError(`WARN: school [${school.urn}] has an unusual dfeNumber [${dfeNumber}]`)
      }
      table.rows.add(dfeNumber, school.estabCode, school.leaCode, school.name, school.urn, school.estabTypeCode)
    }
    const request = new mssql.Request(this.pool)
    if (this.jobResult.schoolsLoaded > 0) {
      try {
        const res = await request.bulk(table)
        this.logger.info('bulk request complete: ', res)
      } catch (error: any) {
        this.logError(`Bulk request failed. Error was:\n ${error.message}`)
        error.jobResult = this.jobResult
        throw error
      }
    }
    return this.jobResult
  }

  private async getToeCodes (): Promise<Array<Record<string, number>>> {
    const sql = `SELECT [id], [code]
                 FROM
                 [mtc_admin].[typeOfEstablishmentLookup] `
    const request = new mssql.Request(this.pool)
    const sqlResult = await request.query(sql)
    // const toeCodes: Array<Record<string, number>> = []
    const recordset = sqlResult.recordset
    const codes = recordset.map(rec => {
      const x: Record<string, number> = {
        id: rec.id,
        code: rec.code
      }
      return x
    })
    return codes
  }

  private getToeCodeId (toeCode: number, existingToeCodes: Array<Record<string, number>>): number {
    // get lookup table for TOE codes into dictionary
    const toeCodeEntry = R.find(R.propEq('code', toeCode), existingToeCodes)
    if (toeCodeEntry === undefined) {
      this.logError(`no toeCodeEntry found with code ${toeCode}`)
      return 0
    }
    this.logInfo(`found entry for code ${toeCode}... ${JSON.stringify(toeCodeEntry, null, 2)}`)
    return toeCodeEntry.id
    /*  let toeCodeId = 0
    // check it exists, insert if not
    if (toeCodeEntry === undefined) {
      // insert it
      const insertedId = 999
      toeCodeId = insertedId
    } else {
      toeCodeId = toeCodeEntry.id
    }
    return toeCodeId */
  }

  async individualUpload (schoolData: ISchoolRecord[]): Promise<SchoolImportJobOutput> {
    const toeCodes = await this.getToeCodes()
    this.logInfo(`toeCodes are...\n ${JSON.stringify(toeCodes, null, 2)}`)
    const sql = `INSERT [mtc_admin].[school] (dfeNumber, estabCode, leaCode, name, urn, typeOfEstablishmentLookup_id)
    VALUES (@dfeNumber, @estabCode, @leaCode, @name, @urn, @toeCodeId)`
    for (let index = 0; index < schoolData.length; index++) {
      const school = schoolData[index]
      const toeCodeId = this.getToeCodeId(school.estabTypeCode, toeCodes)
      const request = new mssql.Request(this.pool)
      request.input('dfeNumber', mssql.TYPES.Int, `${school.leaCode}${school.estabCode}`)
      request.input('estabCode', mssql.TYPES.Int, school.estabCode)
      request.input('leaCode', mssql.TYPES.Int, school.leaCode)
      request.input('name', mssql.TYPES.NVarChar(mssql.MAX), school.name)
      request.input('urn', mssql.TYPES.Int, school.urn)
      request.input('toeCodeId', mssql.TYPES.Int, toeCodeId)
      // add param for sql insert
      try {
        await request.query(sql)
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
