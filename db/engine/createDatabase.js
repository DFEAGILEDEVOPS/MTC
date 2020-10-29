'use strict'

const mssql = require('mssql')
const config = require('../config')
const sqlConfig = require('../sql.config')
const logger = require('./log.service').getLogger()

const adminConfig = {
  server: config.Sql.Server,
  options: {
    database: 'master',
    encrypt: sqlConfig.options.encrypt,
    requestTimeout: config.Sql.Migrator.Timeout,
    port: sqlConfig.port,
    connectTimeout: config.Sql.Migrator.Timeout,
    trustServerCertificate: sqlConfig.options.trustServerCertificate,
    enableArithAbort: sqlConfig.options.enableArithAbort
  },
  authentication: {
    type: 'default',
    options: {
      userName: config.Sql.Migrator.Username,
      password: config.Sql.Migrator.Password
    }
  },
  appName: config.Sql.Application.Name,
  debug: {
    packet: false,
    data: true,
    payload: false,
    token: false
  }
}

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
    logger.info(`attempting to create database ${config.Sql.Database} ${azureOnlyScaleSetting} if it does not already exist...`)
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
  const pool = new mssql.ConnectionPool(adminConfig)
  try {
    logger.info(`attempting to connect to ${adminConfig.server} on ${adminConfig.options.port} within ${adminConfig.options.connectTimeout}ms`)
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
