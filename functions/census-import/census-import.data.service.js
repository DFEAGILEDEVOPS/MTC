const mssql = require('mssql')
const sqlService = require('less-tedious')

const config = require('../config')

/**
 * Create census import table
 * @param {Object} context
 * @param {String} censusTable
 * @param {Array} blobContent
 * @return {Object}
 */
module.exports.sqlCreateCensusImportTable = async (context, censusTable, blobContent) => {
  const poolConfig = {
    database: config.Sql.Database,
    server: config.Sql.Server,
    port: config.Sql.Port,
    requestTimeout: config.Sql.Timeout,
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

  const pool = new mssql.ConnectionPool(poolConfig)
  pool.on('error', err => {
    context.log('SQL Pool Error:', err)
  })
  await pool.connect()

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
  await request.bulk(table)
}

module.exports.sqlInsertCensusImportTableData = async (context, censusTable) => {
  const sql = `
  INSERT INTO [mtc_admin].pupil
  (school_id, foreName, middleNames, lastName, gender, dateOfBirth, upn)
  SELECT
    s.id,
    tmp.forename,
    tmp.middlenames,
    tmp.surname,
    tmp.gender,
    CONVERT(DATETIMEOFFSET(3), tmp.dob, 103),
    tmp.upn
  FROM ${censusTable} tmp
  INNER JOIN mtc_admin.school s
    ON s.dfeNumber = CONVERT(INT, CONCAT(tmp.lea, tmp.estab))
  `
  const result = await sqlService.modify(sql)
  return result.rowsModified
}
