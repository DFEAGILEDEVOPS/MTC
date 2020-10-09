import * as mssql from 'mssql'
import * as R from 'ramda'

export interface ICensusImportDataService {
  loadStagingTable (tableName: string, blobContent: string[][]): Promise<number>
  loadPupilsFromStaging (tableName: string, jobId: number): Promise<any>
  deleteStagingTable (tableName: string): Promise<mssql.IResult<any>>
}

export class CensusImportDataService implements ICensusImportDataService {

  private pool: mssql.ConnectionPool

  constructor (pool: mssql.ConnectionPool) {
    this.pool = pool
  }

  /**
   * Create census import staging table
   * @param {String} tableName
   * @param {Array<string[]>} blobContent
   * @return {Object}
   */
  async loadStagingTable (tableName: string, blobContent: string[][]): Promise<number> {
    const table = new mssql.Table(tableName)
    table.create = true
    table.columns.add('id', mssql.Int, { nullable: false, primary: true, identity: true })
    table.columns.add('lea', mssql.NVarChar(mssql.MAX), { nullable: false })
    table.columns.add('estab', mssql.NVarChar(mssql.MAX), { nullable: false })
    table.columns.add('upn', mssql.NVarChar(mssql.MAX), { nullable: false })
    table.columns.add('surname', mssql.NVarChar(mssql.MAX), { nullable: false })
    table.columns.add('forename', mssql.NVarChar(mssql.MAX), { nullable: false })
    table.columns.add('middlenames', mssql.NVarChar(mssql.MAX), { nullable: false })
    table.columns.add('gender', mssql.NVarChar(mssql.MAX), { nullable: false })
    table.columns.add('dob', mssql.NVarChar(mssql.MAX), { nullable: false })
    // skip zero index entry, as its a header row
    for (let i = 1; i < blobContent.length; i++) {
      const row = blobContent[i]
      table.rows.add(i, row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8])
    }
    const request = new mssql.Request(this.pool)
    const result = await request.bulk(table)
    return result.rowsAffected
  }

  /**
   * Execute stored procedure to load pupils from staging to pupils table
   * @param {String} tableName
   * @param {Number} jobId
   * @return {Object}
   */
  async loadPupilsFromStaging (tableName: string, jobId: number): Promise<any> {
    const sql = `
    DECLARE @citt [mtc_census_import].censusImportTableType
    INSERT INTO @citt SELECT * FROM ${tableName}
    EXEC [mtc_census_import].[spPupilCensusImportFromStaging] @censusImportTable = @citt, @jobId = ${jobId}
    `
    const request = new mssql.Request(this.pool)
    const result = await request.query(sql)
    return R.head(result.recordset)
  }

  /**
   * Delete census import staging table
   * @param {String} tableName
   * @return {Object}
   */
  async deleteStagingTable (tableName: string): Promise<mssql.IResult<any>> {
    const request = new mssql.Request(this.pool)
    const sql = `DROP TABLE ${tableName};`
    return request.query(sql)
  }
}
