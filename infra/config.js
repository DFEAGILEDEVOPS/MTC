'use strict'
require('dotenv').config()
const toBool = require('to-bool')
const sql = require('./sql.config')
const twoMinutesInMilliseconds = 120000

const getEnvironment = () => {
  return process.env.ENVIRONMENT_NAME || 'Local-Dev'
}

module.exports = {
  LogLevel: process.env.LOG_LEVEL || 'info',
  Environment: getEnvironment(),
  Sql: {
    Database: sql.database,
    Server: sql.server,
    Port: sql.port,
    requestTimeout: sql.requestTimeout,
    connectionTimeout: sql.connectionTimeout,
    Encrypt: sql.options.encrypt,
    Application: {
      Name: sql.options.appName,
      Username: sql.user,
      Password: sql.password
    },
    Pooling: {
      MinCount: sql.pool.min,
      MaxCount: sql.pool.max,
      // DEPRECATED - not supported in MSSQL
      LoggingEnabled: {}.hasOwnProperty.call(process.env, 'SQL_POOL_LOG_ENABLED') ? toBool(process.env.SQL_POOL_LOG_ENABLED) : false
    },
    Migrator: {
      Username: process.env.SQL_ADMIN_USER || 'sa', // docker default
      Password: process.env.SQL_ADMIN_USER_PASSWORD || 'Mtc-D3v.5ql_S3rv3r', // docker default
      Timeout: parseInt(process.env.SQL_MIGRATION_TIMEOUT, 10) || twoMinutesInMilliseconds
    },
    PupilCensus: {
      Username: process.env.SQL_PUPIL_CENSUS_USER || 'CensusImportUser',
      Password: process.env.SQL_PUPIL_CENSUS_USER_PASSWORD
    },
    Azure: {
      Scale: process.env.SQL_AZURE_SCALE
    },
    AllowReadsFromReplica: {}.hasOwnProperty.call(process.env, 'SQL_ALLOW_REPLICA_FOR_READS') ? toBool(process.env.SQL_ALLOW_REPLICA_FOR_READS) : false
  },
  DatabaseRetry: {
    MaxRetryAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS, 10) || 3,
    InitialPauseMs: parseInt(process.env.RETRY_PAUSE_MS, 10) || 5000,
    PauseMultiplier: parseFloat(process.env.RETRY_PAUSE_MULTIPLIER) || 1.5
  }
}
