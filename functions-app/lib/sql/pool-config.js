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
  if (typeof config.requestTimeout !== 'number') {
    throw new Error(`requestTimeout must be a number`)
  }
  if (typeof config.connectionTimeout !== 'number') {
    throw new Error(`connectionTimeout must be a number`)
  }
}

validateSqlConfig(sqlConfig)

const mssqlConfig = {
  user: sqlConfig.Application.Username,
  password: sqlConfig.Application.Password,
  server: sqlConfig.Server,
  database: sqlConfig.Database,
  connectionTimeout: sqlConfig.connectionTimeout,
  requestTimeout: sqlConfig.requestTimeout,
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
