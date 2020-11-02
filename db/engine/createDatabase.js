'use strict'

const mssql = require('mssql')
const config = require('../config')
const sqlConfig = require('../sql.config')
const logger = require('./log.service').getLogger()

async function executeRequest (pool, sql) {
  const req = new mssql.Request(pool)
  const result = await req.query(sql)
  return result
}

async function createDatabase (pool) {
  try {
    let azureOnlyScaleSetting = ''
    if (config.Sql.Azure.Scale) {
      azureOnlyScaleSetting = `(SERVICE_OBJECTIVE = '${config.Sql.Azure.Scale}')`
    }
    logger.info(`attempting to create ${config.Sql.Database} ${azureOnlyScaleSetting} if it does not already exist (timeout:${sqlConfig.requestTimeout}ms)...`)
    const createDbSql = `
      IF NOT EXISTS(SELECT * FROM sys.databases WHERE name='${config.Sql.Database}')
        BEGIN
          CREATE DATABASE [${config.Sql.Database}] ${azureOnlyScaleSetting};
          SELECT 'Database Created' as [response];
        END
      ELSE
        SELECT 'Database Already Exists' as [response]`
    const result = await executeRequest(pool, createDbSql)
    const output = result.recordset[0].response
    logger.info(output)
  } catch (error) {
    logger.error(error)
  }
}

async function main () {
  const pool = new mssql.ConnectionPool(sqlConfig)
  try {
    logger.info(`attempting to connect to ${sqlConfig.server} on ${sqlConfig.port} within ${sqlConfig.connectionTimeout}ms`)
    await pool.connect()
    logger.info('connected.')
    await createDatabase(pool)
    logger.info('closing database connection...')
    await pool.close()
  } catch (error) {
    logger.error('error creating database...')
    logger.error(error)
  }
}

module.exports = main
