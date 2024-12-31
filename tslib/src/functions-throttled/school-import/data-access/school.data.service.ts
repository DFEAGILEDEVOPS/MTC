import * as mssql from 'mssql'
import * as R from 'ramda'
import { type ILogger } from '../../../common/logger'
import { type SchoolImportJobOutput } from '../SchoolImportJobOutput'
import { type ISchoolRecord } from './ISchoolRecord'

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
    this.logger.trace('SchoolDataService.bulkUpload() called')

    const table = new mssql.Table('[mtc_admin].[school]')
    table.create = false
    table.columns.add('dfeNumber', mssql.Int, { nullable: false })
    table.columns.add('estabCode', mssql.Int, { nullable: false })
    table.columns.add('leaCode', mssql.Int, { nullable: false })
    table.columns.add('name', mssql.NVarChar(mssql.MAX), { nullable: false })
    table.columns.add('urn', mssql.Int, { nullable: false })
    table.columns.add('typeOfEstablishmentLookup_id', mssql.Int, { nullable: true })

    for (const school of schoolData) {
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

  private async getExistingEstabTypes (): Promise<Record<string, number>[]> {
    const sql = `SELECT [id], [code]
                 FROM
                 [mtc_admin].[typeOfEstablishmentLookup] `
    const request = new mssql.Request(this.pool)
    const sqlResult = await request.query(sql)
    const recordset = sqlResult.recordset
    const estabTypes = recordset.map(rec => {
      const x: Record<string, number> = {
        id: rec.id,
        code: rec.code
      }
      return x
    })
    return estabTypes
  }

  private async getEstabTypeId (estabTypeCode: number, estabTypeName: string, existingEstabTypes: Record<string, number>[]): Promise<number> {
    const estabTypeEntry = R.find(R.propEq(estabTypeCode, 'code'), existingEstabTypes)
    if (estabTypeEntry === undefined) {
      this.logInfo(`no estabType found with code ${estabTypeCode}, attempting to add...`)
      const newId = await this.addEstabType(estabTypeCode, estabTypeName)
      existingEstabTypes.push({
        id: newId,
        code: estabTypeCode
      })
      return newId
    }
    return estabTypeEntry.id
  }

  private async addEstabType (estabTypeCode: number, estabTypeName: string): Promise<number> {
    this.logInfo(`adding new estabType. code:${estabTypeCode} name:${estabTypeName}.`)
    const sql = `
      INSERT mtc_admin.[typeOfEstablishmentLookup] ([name], [code])
      VALUES (@name, @code);
      SELECT SCOPE_IDENTITY() AS [insertedId]`
    const request = new mssql.Request(this.pool)
    request.input('name', mssql.TYPES.NVarChar(50), estabTypeName)
    request.input('code', mssql.TYPES.Int, estabTypeCode)
    request.output('insertedId', mssql.TYPES.Int)
    const result = await request.query(sql)
    const id = result.recordset[0].insertedId
    this.logInfo(`inserted estabType. id is ${id}`)
    return id
  }

  async individualUpload (schoolData: ISchoolRecord[]): Promise<SchoolImportJobOutput> {
    const toeCodes = await this.getExistingEstabTypes()
    const sql = `
      INSERT [mtc_admin].[school] (dfeNumber, estabCode, leaCode, name, urn, typeOfEstablishmentLookup_id)
      VALUES (@dfeNumber, @estabCode, @leaCode, @name, @urn, @toeCodeId);`
    for (const school of schoolData) {
      const toeCodeId = await this.getEstabTypeId(school.estabTypeCode, school.estabTypeName, toeCodes)
      const request = new mssql.Request(this.pool)
      request.input('dfeNumber', mssql.TYPES.Int, `${school.leaCode}${school.estabCode}`)
      request.input('estabCode', mssql.TYPES.Int, school.estabCode)
      request.input('leaCode', mssql.TYPES.Int, school.leaCode)
      request.input('name', mssql.TYPES.NVarChar(mssql.MAX), school.name)
      request.input('urn', mssql.TYPES.Int, school.urn)
      request.input('toeCodeId', mssql.TYPES.Int, toeCodeId)
      try {
        await request.query(sql)
        this.logger.info(`school imported. urn:${school.urn}`)
        this.jobResult.linesProcessed += 1
        this.jobResult.schoolsLoaded += 1
      } catch (error) {
        let errorMessage = 'unknown error'
        if (error instanceof Error) {
          errorMessage = error.message
        }
        this.logError(`insert failed for school. urn:${school.urn} error: ${errorMessage}`)
        this.jobResult.linesProcessed += 1
      }
    }
    return this.jobResult
  }
}
