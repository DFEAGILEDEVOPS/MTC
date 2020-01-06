'use strict'

const mssql = require('mssql')
const config = require('../config')
const logger = require('../log.service').getLogger()

const dbConfig = {
  user: config.Sql.user,
  password: config.Sql.password,
  server: config.Sql.server,
  database: 'master',
  port: config.Sql.port,
  connectionTimeout: config.Sql.connectionTimeout,
  requestTimeout: config.Sql.requestTimeout
}

const createDatabase = async () => {
  try {
    let azureOnlyScaleSetting = ''
    if (config.Sql.Azure.Scale) {
      azureOnlyScaleSetting = `(SERVICE_OBJECTIVE = '${config.Sql.Azure.Scale}')`
    }
    logger.info(`attempting to connect to ${dbConfig.server} on ${dbConfig.port} within ${dbConfig.connectionTimeout}ms`)
    await mssql.connect(dbConfig)
    logger.info(`attempting to create database ${config.Sql.database} ${azureOnlyScaleSetting} if it does not already exist...`)
    const createDbSql = `IF NOT EXISTS(SELECT * FROM sys.databases WHERE name='${config.Sql.database}')
    BEGIN CREATE DATABASE [${config.Sql.database}] ${azureOnlyScaleSetting}; SELECT 'Database Created'; END ELSE SELECT 'Database Already Exists'`
    return mssql.query(createDbSql)
  } catch (error) {
    console.error(error)
  }
}

// NB `main` return a Promise because it wraps the `connection.on()` call.  It CAN be awaited on.
module.exports = createDatabase
