'use strict'
const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '.env')
const toBool = require('to-bool')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    // console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.log('config.js: No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}

const sql = require('./sql.config')

const threeMinutesInMilliseconds = 180000
const thirtySecondsInMilliseconds = 30000

const getEnvironment = () => {
  return process.env.ENVIRONMENT_NAME || 'Local-Dev'
}

const getLinesPerCheck = () => {
  const defaultValue = 25
  const val = process.env.LINES_PER_CHECK_FORM
  const parsed = parseInt(val, 10)
  if (isNaN(parsed)) return defaultValue
  if (parsed < 1) return defaultValue
  return parsed
}

module.exports = {
  DEFAULT_TIMEZONE: 'Europe/London',
  Environment: getEnvironment(),
  LINES_PER_CHECK_FORM: getLinesPerCheck(),
  Data: {
    allowedWords: process.env.ALLOWED_WORDS || 'aaa,bcd,dcd,tfg,bxx',
    pinSubmissionMaxAttempts: process.env.PIN_SUBMISSION_MAX_ATTEMPTS || 100,
    helplineNumber: process.env.HELPLINE_NUMBER || '0300 303 3013',
    pupilCensusMaxSizeFileUploadMb: process.env.PUPIL_CENSUS_MAX_FILE_UPLOAD_MB || 100 * 1024 * 1024,
    psychometricianReportMaxSizeFileUploadMb: process.env.PS_REPORT_MAX_FILE_UPLOAD_MB || 100 * 1024 * 1024
  },
  Logging: {
    LogLevel: process.env.LOG_LEVEL || 'info',
    DebugVerbosity: {}.hasOwnProperty.call(process.env, 'DEBUG_VERBOSITY') ? parseInt(process.env.DEBUG_VERBOSITY, 10) : 1
  },
  Sql: {
    Database: sql.database,
    Server: sql.server,
    Port: sql.port,
    // DEPRECATED - misused across both request and connection timeouts
    Timeout: parseInt(process.env.SQL_TIMEOUT, 10) || thirtySecondsInMilliseconds,
    requestTimeout: sql.requestTimeout,
    connectionTimeout: sql.connectionTimeout,
    Encrypt: sql.options.encrypt,
    Application: {
      Name: sql.options.appName,
      Username: sql.user,
      Password: sql.password
    },
    FunctionsApp: {
      // used by the etl function to sync the table storage results to sql server
      Username: process.env.SQL_FUNCTIONS_APP_USER || 'functionsAppSystemUser',
      Password: process.env.SQL_FUNCTIONS_APP_USER_PASSWORD || 'functionsAppSystemP4ssw0rd!' // default only for local docker
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
      Timeout: parseInt(process.env.SQL_MIGRATION_TIMEOUT, 10) || threeMinutesInMilliseconds
    },
    Azure: {
      // https://learn.microsoft.com/en-us/azure/azure-sql/database/resource-limits-vcore-single-databases?view=azuresql
      // https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-database-service-objectives-azure-sql-database?view=azuresqldb-current
      Scale: process.env.SQL_AZURE_SCALE
    },
    AllowReadsFromReplica: {}.hasOwnProperty.call(process.env, 'SQL_ALLOW_REPLICA_FOR_READS') ? toBool(process.env.SQL_ALLOW_REPLICA_FOR_READS) : false,
    TechSupport: {
      Username: process.env.SQL_TECH_SUPPORT_USER || 'TechSupportUser',
      Password: process.env.SQL_TECH_SUPPORT_USER_PASSWORD,
      Pool: {
        Min: parseInt(process.env.TECH_SUPPORT_SQL_POOL_MIN_COUNT, 10) || 0,
        Max: parseInt(process.env.TECH_SUPPORT_SQL_POOL_MIN_COUNT, 10) || 2
      }
    },
    SqlSupport: {
      Username: process.env.SQL_SUPPORT_USER || 'SqlSupportUser',
      Password: process.env.SQL_SUPPORT_USER_PASSWORD
    }
  },
  DatabaseRetry: {
    MaxRetryAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS, 10) || 3,
    InitialPauseMs: parseInt(process.env.RETRY_PAUSE_MS, 10) || 5000,
    PauseMultiplier: parseFloat(process.env.RETRY_PAUSE_MULTIPLIER) || 1.5
  }
}
