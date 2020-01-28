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
const yargs = require('yargs').argv

const thirtySecondsInMilliseconds = 30000
const oneMinuteInMilliseconds = 60000
const twoMinutesInMilliseconds = 120000

module.exports = {
  LogLevel: process.env.LOG_LEVEL || 'info',
  Environment: process.env.ENVIRONMENT_NAME || 'Local-Dev',
  Sql: {
    database: yargs.database || process.env.SQL_DATABASE || 'mtc',
    server: yargs.dbserver || process.env.SQL_SERVER || 'localhost',
    port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT) : 1433,
    requestTimeout: parseInt(process.env.SQL_REQUEST_TIMEOUT, 10) || oneMinuteInMilliseconds,
    connectionTimeout: parseInt(process.env.SQL_CONNECT_TIMEOUT, 10) || thirtySecondsInMilliseconds,
    migrationTimeout: parseInt(process.env.SQL_MIGRATION_TIMEOUT, 10) || twoMinutesInMilliseconds,
    user: yargs.dbuser || process.env.SQL_ADMIN_USER || 'sa', // docker default
    password: yargs.dbpassword || process.env.SQL_ADMIN_USER_PASSWORD || 'Mtc-D3v.5ql_S3rv3r', // docker default
    options: {
      appName: process.env.SQL_APP_NAME || 'mtc-local-dev', // docker default
      encrypt: {}.hasOwnProperty.call(process.env, 'SQL_ENCRYPT') ? toBool(process.env.SQL_ENCRYPT) : true
    },
    PupilCensus: {
      Username: process.env.SQL_PUPIL_CENSUS_USER || 'CensusImportUser',
      Password: process.env.SQL_PUPIL_CENSUS_USER_PASSWORD
    },
    Azure: {
      Scale: process.env.SQL_AZURE_SCALE
    }
  },
  DatabaseRetry: {
    MaxRetryAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS, 10) || 3,
    InitialPauseMs: parseInt(process.env.RETRY_PAUSE_MS, 10) || 5000,
    PauseMultiplier: parseFloat(process.env.RETRY_PAUSE_MULTIPLIER) || 1.5
  }
}
