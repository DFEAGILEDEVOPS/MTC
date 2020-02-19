const mssql = require('mssql') /* special */
const config = require('../config')
const R = require('ramda')

let pool

module.exports.initPool = async function initPool (context) {
  const poolConfig = {
    database: config.Sql.Database,
    server: config.Sql.Server,
    port: config.Sql.Port,
    requestTimeout: 10 * 60 * 1000,
    connectionTimeout: config.Sql.Timeout,
    user: config.Sql.PupilCensus.Username,
    password: config.Sql.PupilCensus.Password,
    pool: {
      min: 1,
      max: 3
    },
    options: {
      appName: config.Sql.Application.Name, // docker default
      encrypt: config.Sql.Encrypt
    }
  }

  pool = new mssql.ConnectionPool(poolConfig)
  pool.on('error', err => {
    context.log('SQL Pool Error:', err)
  })
  await pool.connect()
  return pool
}

/**
 * Create census import staging table
 * @param {Object} context
 * @param {Object} pool
 * @param {String} censusTable
 * @param {Array} blobContent
 * @return {Object}
 */
module.exports.sqlLoadStagingTable = async (context, pool, censusTable, blobContent) => {
  if (!pool) {
    await this.initPool(context)
  }
  const table = new mssql.Table(censusTable)
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
module.exports.sqlLoadPupilsFromStaging = async (context, pool, censusTable, jobId) => {
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
module.exports.sqlDeleteStagingTable = async (context, pool, censusTable) => {
  const request = new mssql.Request(pool)
  const sql = `DROP TABLE ${censusTable};`
  return request.query(sql)
}
