'use strict'

const mssql = require('mssql')
const sqlConfig = require('../../config').Sql

function validateSqlConfig (config) {
  const ex = (propertyName) => {
    throw new Error(`${propertyName} is required`)
  }
  if (!config.Application.Username) {
    ex('Application.Username')
  }
  if (!config.Application.Password) {
    ex('Application.Password')
  }
  if (!config.Server) {
    ex('Server')
  }
  if (!config.Database) {
    ex('Server')
  }
}

validateSqlConfig(sqlConfig)

const mssqlConfig = {
  user: sqlConfig.Application.Username,
  password: sqlConfig.Application.Password,
  server: sqlConfig.Server,
  database: sqlConfig.Database,
  connectionTimeout: parseInt(sqlConfig.connectionTimeout, 10),
  requestTimeout: parseInt(sqlConfig.requestTimeout, 10),
  pool: {
    max: sqlConfig.Pooling.MaxCount || 5,
    min: sqlConfig.Pooling.MinCount || 0,
    idleTimeoutMillis: sqlConfig.Pooling.IdleTimeout || 30000
  },
  options: {
    encrypt: sqlConfig.Encrypt
  }
}

const poolPromise = new mssql.ConnectionPool(mssqlConfig).connect().then(pool => {
  console.log('Connected to MSSQL')
  return pool
})
  .catch(err => console.error('Database Connection Failed! Error: ', err))

module.exports = {
  mssql, poolPromise
}
