'use strict'

const mssql = require('mssql')
const config = require('../config')
const sqlConfig = require('../sql.config')
const logger = require('./log.service').getLogger()
const R = require('ramda')

async function executeRequest (pool, sql) {
  const req = new mssql.Request(pool)
  const result = await req.query(sql)
  return result
}

async function createDatabase (pool) {
    let azureOnlyScaleSetting = ''
    if (config.Sql.Azure.Scale) {
      // https://learn.microsoft.com/en-us/azure/azure-sql/database/resource-limits-vcore-single-databases?view=azuresql
      // https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-database-service-objectives-azure-sql-database?view=azuresqldb-current
      azureOnlyScaleSetting = `(SERVICE_OBJECTIVE = '${config.Sql.Azure.Scale}')`
    }
    logger.info(`attempting to create database ${config.Sql.Database}${azureOnlyScaleSetting} if it does not already exist (timeout:${config.Sql.Migrator.Timeout}ms)...`)
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
}

async function main () {
  const migratorConfig = R.clone(sqlConfig)
  migratorConfig.user = config.Sql.Migrator.Username
  migratorConfig.password = config.Sql.Migrator.Password
  migratorConfig.requestTimeout = config.Sql.Migrator.Timeout
  migratorConfig.database = 'master'
  const pool = new mssql.ConnectionPool(migratorConfig)
  try {
    logger.info(`createDatabase: attempting to connect to ${migratorConfig.server}:${migratorConfig.port} within ${migratorConfig.connectionTimeout}ms`)
    await pool.connect()
    logger.info('createDatabase: connected.')
    await createDatabase(pool)
    logger.info('createDatabase: closing database connection...')
    await pool.close()
  } finally {
    if (pool && (pool.connecting || pool.connected)) {
      pool.close()
    }
  }
}

module.exports = main
