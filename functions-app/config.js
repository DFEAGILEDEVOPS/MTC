'use strict'
const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '.env')
const { cast, getEnvWithTypeOrDefault } = require('./lib/get-env')

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
const os = require('os')
const oneMinuteInMilliseconds = 60000
const fiveMinutesInMilliseconds = oneMinuteInMilliseconds * 5
const twoHoursInMilliseconds = oneMinuteInMilliseconds * 120

const getEnvironment = () => {
  return process.env.ENVIRONMENT_NAME || 'Local-Dev'
}

module.exports = {
  AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING,
  PsReportTemp: getEnvWithTypeOrDefault('PS_REPORT_TEMP_ROOT', null, '', process.env),
  Sql: {
    Database: process.env.SQL_DATABASE || 'mtc',
    Server: process.env.SQL_SERVER || 'localhost',
    Port: process.env.SQL_PORT || 1433,
    Timeout: process.env.SQL_TIMEOUT || oneMinuteInMilliseconds,
    requestTimeout: getEnvWithTypeOrDefault('SQL_REQUEST_TIMEOUT', cast.toInt, fiveMinutesInMilliseconds, process.env),
    censusRequestTimeout: getEnvWithTypeOrDefault('SQL_CENSUS_REQUEST_TIMEOUT', cast.toInt, twoHoursInMilliseconds, process.env),
    connectionTimeout: getEnvWithTypeOrDefault('SQL_CONNECTION_TIMEOUT', cast.toInt, oneMinuteInMilliseconds, process.env),
    Encrypt: getEnvWithTypeOrDefault('SQL_ENCRYPT', cast.toBoolean, true, process.env),
    EnableArithAbort: getEnvWithTypeOrDefault('SQL_ENABLE_ARITH_ABORT', cast.toBoolean, true, process.env),
    Application: {
      Name: process.env.SQL_APP_NAME || 'mtc-local-dev', // docker default
      Username: process.env.SQL_APP_USER || 'mtcAdminUser', // docker default
      Password: process.env.SQL_APP_USER_PASSWORD || 'your-chosen*P4ssw0rd_for_dev_env!' // docker default
    },
    PupilCensus: {
      Username: process.env.SQL_PUPIL_CENSUS_USER || 'CensusImportUser',
      Password: process.env.SQL_PUPIL_CENSUS_USER_PASSWORD
    },
    Pooling: {
      MinCount: parseInt(process.env.SQL_POOL_MIN_COUNT, 10) || 5,
      MaxCount: parseInt(process.env.SQL_POOL_MAX_COUNT, 10) || 10,
      LoggingEnabled: getEnvWithTypeOrDefault('SQL_POOL_LOG_ENABLED', cast.toBoolean, true, process.env)
    },
    Azure: {
      Scale: process.env.SQL_AZURE_SCALE
    }
  },
  DatabaseRetry: {
    MaxRetryAttempts: getEnvWithTypeOrDefault('RETRY_MAX_ATTEMPTS', cast.toInt, 3, process.env),
    InitialPauseMs: getEnvWithTypeOrDefault('RETRY_PAUSE_MS', cast.toInt, 5000, process.env),
    PauseMultiplier: getEnvWithTypeOrDefault('RETRY_PAUSE_MULTIPLIER', cast.toNumber, 1.5, process.env)
  },
  Logging: {
    LogLevel: process.env.LOG_LEVEL || 'debug',
    LogDna: {
      key: process.env.LOGDNA_API_KEY,
      hostname: `${os.hostname()}:${process.pid}`,
      ip: undefined,
      mac: undefined,
      app: `MTCAdmin:${getEnvironment()}`,
      env: `${getEnvironment()}`
    },
    Express: {
      UseWinston: process.env.EXPRESS_LOGGING_WINSTON || false
    },
    ApplicationInsights: {
      LogToWinston: process.env.APPINSIGHTS_WINSTON_LOGGER || false,
      Key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY
    }
  },
  Environment: getEnvironment(),
  RedisResultsExpiryInSeconds: getEnvWithTypeOrDefault('REDIS_RESULTS_EXPIRY_IN_SECONDS', cast.toInt, 15778800, process.env),
  SchoolResultsCacheLoadAsyncLimit: getEnvWithTypeOrDefault('SCHOOL_RESULTS_CACHE_LOAD_ASYNC_LIMIT', cast.toInt, 6, process.env),
  Redis: {
    Host: process.env.REDIS_HOST || 'localhost',
    Port: process.env.REDIS_PORT || 6379,
    Key: process.env.REDIS_KEY,
    useTLS: getEnvironment() !== 'Local-Dev'
  }
}
