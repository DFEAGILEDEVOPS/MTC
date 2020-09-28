import { Context } from '@azure/functions'
import * as mssql from 'mssql'
import config from '../../config'
const R = require('ramda')

export class CensusImportDataService {

  private pool: mssql.ConnectionPool

  async initPool (context: Context): Promise<mssql.ConnectionPool> {
    // TODO check for init first?
    const poolConfig = {
      database: config.Sql.database,
      server: config.Sql.server,
      port: config.Sql.port,
      requestTimeout: config.Sql.censusRequestTimeout,
      connectionTimeout: config.Sql.connectionTimeout,
      user: config.Sql.PupilCensus.Username,
      password: config.Sql.PupilCensus.Password,
      pool: {
        min: config.Sql.Pooling.MinCount,
        max: config.Sql.Pooling.MaxCount
      },
      options: {
        appName: config.Sql.options.appName, // docker default
        encrypt: config.Sql.options.encrypt
      }
    }

    this.pool = new mssql.ConnectionPool(poolConfig)
    this.pool.on('error', err => {
      context.log('SQL Pool Error:', err)
    })
    await this.pool.connect()
    return this.pool
  }

  /**
   * Create census import staging table
   * @param {Object} context
   * @param {Object} pool
   * @param {String} censusTable
   * @param {Array} blobContent
   * @return {Object}
   */
  async sqlLoadStagingTable (context: Context, pool: mssql.ConnectionPool, censusTable: any, blobContent: any): Promise<number> {
    if (!pool) {
      await this.initPool(context)
    }
    const table = new mssql.Table(censusTable)
    table.create = true
    table.columns.add('id', mssql.Int, { nullable: false, primary: true, identity: true }) // TODO extend?
    table.columns.add('lea', mssql.NVarChar(mssql.MAX), { nullable: false })
    table.columns.add('estab', mssql.NVarChar(mssql.MAX), { nullable: false })
    table.columns.add('upn', mssql.NVarChar(mssql.MAX), { nullable: false })
    table.columns.add('surname', mssql.NVarChar(mssql.MAX), { nullable: false })
    table.columns.add('forename', mssql.NVarChar(mssql.MAX), { nullable: false })
    table.columns.add('middlenames', mssql.NVarChar(mssql.MAX), { nullable: false })
    table.columns.add('gender', mssql.NVarChar(mssql.MAX), { nullable: false })
    table.columns.add('dob', mssql.NVarChar(mssql.MAX), { nullable: false })
    for (let i = 1; i < blobContent.length; i++) {
      const row = blobContent[i]
      table.rows.add(i, row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8])
    }

    const request = new mssql.Request(pool)
    const result = await request.bulk(table)
    return result.rowsAffected
  }

  /**
   * Execute stored procedure to load pupils from staging to pupils table
   * @param {Object} context
   * @param {Object} pool
   * @param {String} censusTable
   * @param {Number} jobId
   * @return {Object}
   */
  async sqlLoadPupilsFromStaging (context: Context, pool: mssql.ConnectionPool, censusTable: string, jobId: string): Promise<any> {
    if (!pool) {
      await this.initPool(context)
    }
    const sql = `
    DECLARE @citt mtc_census_import.censusImportTableType
    INSERT INTO @citt SELECT * FROM ${censusTable}
    EXEC mtc_census_import.spPupilCensusImportFromStaging @censusImportTable = @citt, @jobId = ${jobId}
    `
    const request = new mssql.Request(pool)
    const result = await request.query(sql)
    return R.head(result.recordset)
  }

  /**
   * Delete census import staging table
   * @param {Object} context
   * @param {Object} pool
   * @param {String} censusTable
   * @return {Object}
   */
  async sqlDeleteStagingTable (context: Context, pool: mssql.ConnectionPool, censusTable: string): Promise<mssql.IResult<any>> {
    const request = new mssql.Request(pool)
    const sql = `DROP TABLE ${censusTable};`
    return request.query(sql)
  }
}
