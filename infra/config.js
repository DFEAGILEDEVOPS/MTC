'use strict'
require('dotenv').config()
const toBool = require('to-bool')
const twoMinutesInMilliseconds = 120000
const thirtySecondsInMilliseconds = 30000
const oneMinuteInMilliseconds = 60000

const getEnvironment = () => {
  return process.env.ENVIRONMENT_NAME || 'Local-Dev'
}

module.exports = {
  Environment: getEnvironment(),
  database: process.env.SQL_DATABASE || 'mtc',
  server: process.env.SQL_SERVER || 'localhost',
  // Required for when SQL_PORT is passed in via docker-compose
  port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT) : 1433,
  requestTimeout: parseInt(process.env.SQL_REQUEST_TIMEOUT, 10) || oneMinuteInMilliseconds,
  connectionTimeout: parseInt(process.env.SQL_CONNECT_TIMEOUT, 10) || thirtySecondsInMilliseconds,
  user: process.env.SQL_ADMIN_USER || 'sa', // docker default
  password: process.env.SQL_ADMIN_USER_PASSWORD || 'Mtc-D3v.5ql_S3rv3r', // docker default
  pool: {
    min: process.env.SQL_POOL_MIN_COUNT || 0,
    max: process.env.SQL_POOL_MAX_COUNT || 5,
    acquireTimeoutMillis: parseInt(process.env.SQL_POOL_ACQUIRE_TIMEOUT, 10) || thirtySecondsInMilliseconds
  },
  options: {
    appName: process.env.SQL_APP_NAME || 'mtc-local-dev', // docker default
    encrypt: {}.hasOwnProperty.call(process.env, 'SQL_ENCRYPT') ? toBool(process.env.SQL_ENCRYPT) : true
  },
  Migrator: {
    Timeout: parseInt(process.env.SQL_MIGRATION_TIMEOUT, 10) || twoMinutesInMilliseconds
  },
  PupilCensus: {
    Username: process.env.SQL_PUPIL_CENSUS_USER || 'CensusImportUser',
    Password: process.env.SQL_PUPIL_CENSUS_USER_PASSWORD
  },
  Azure: {
    Scale: process.env.SQL_AZURE_SCALE
  },
  DatabaseRetry: {
    MaxRetryAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS, 10) || 3,
    InitialPauseMs: parseInt(process.env.RETRY_PAUSE_MS, 10) || 5000,
    PauseMultiplier: parseFloat(process.env.RETRY_PAUSE_MULTIPLIER) || 1.5
  }
}
