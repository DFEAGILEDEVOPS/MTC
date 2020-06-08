'use strict'

const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '..', '.env')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}
const toBool = require('to-bool')
const config = require('../config')

const thirtySecondsInMilliseconds = 30000
const oneMinuteInMilliseconds = 60000

module.exports = {
  database: process.env.SQL_DATABASE_REPLICA || 'mtc',
  server: process.env.SQL_SERVER_REPLICA || 'localhost',
  // Required for when SQL_PORT is passed in via docker-compose
  port: process.env.SQL_PORT_REPLICA ? parseInt(process.env.SQL_PORT_REPLICA) : 1433,
  requestTimeout: parseInt(process.env.SQL_REQUEST_TIMEOUT_REPLICA, 10) || oneMinuteInMilliseconds,
  connectionTimeout: parseInt(process.env.SQL_CONNECT_TIMEOUT_REPLICA, 10) || thirtySecondsInMilliseconds,
  user: config.Sql.Application.Username,
  password: config.Sql.Application.Password,
  pool: {
    min: parseInt(process.env.SQL_POOL_MIN_COUNT_REPLICA, 10) || 0,
    max: parseInt(process.env.SQL_POOL_MAX_COUNT_REPLICA, 10) || 5,
    acquireTimeoutMillis: parseInt(process.env.SQL_POOL_ACQUIRE_TIMEOUT_REPLICA, 10) || thirtySecondsInMilliseconds
  },
  options: {
    appName: `${config.Sql.Application.name}:Readonly`,
    encrypt: config.Sql.Encrypt,
    readOnlyIntent: {}.hasOwnProperty.call(process.env, 'SQL_READONLY_INTENT') ? toBool(process.env.SQL_READONLY_INTENT) : true,
    enableArithAbort: {}.hasOwnProperty.call(process.env, 'SQL_ENABLE_ARITH_ABORT') ? toBool(process.env.SQL_ENABLE_ARITH_ABORT) : true
  }
}
