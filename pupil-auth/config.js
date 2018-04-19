'use strict'
require('dotenv').config()
const os = require('os')
const toBool = require('to-bool')

const twoMinutesInMilliseconds = 120000
const oneMinuteInMilliseconds = 60000

const getEnvironment = () => {
  return process.env.ENVIRONMENT_NAME || 'Local-Dev'
}

module.exports = {
  AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING,
  MONGO_CONNECTION_STRING: process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost/mtc',
  PORT: process.env.PORT || '3003',
  QUESTION_TIME_LIMIT: 5,
  TIME_BETWEEN_QUESTIONS: 2,
  Data: {
  },
  Sql: {
    Enabled: true, // deprecated, to be removed
    Database: process.env.SQL_DATABASE || 'mtc',
    Server: process.env.SQL_SERVER || 'localhost',
    Port: process.env.SQL_PORT || 1433,
    Timeout: process.env.SQL_TIMEOUT || oneMinuteInMilliseconds,
    Encrypt: process.env.hasOwnProperty('SQL_ENCRYPT') ? toBool(process.env.SQL_ENCRYPT) : true,
    Application: {
      Name: process.env.SQL_APP_NAME || 'mtc-local-dev', // docker default
      Username: process.env.SQL_APP_USER || 'mtcAdminUser', // docker default
      Password: process.env.SQL_APP_USER_PASSWORD || 'your-chosen*P4ssw0rd_for_dev_env!' // docker default
    },
    Pooling: {
      MinCount: process.env.SQL_POOL_MIN_COUNT || 5,
      MaxCount: process.env.SQL_POOL_MAX_COUNT || 10,
      LoggingEnabled: process.env.hasOwnProperty('SQL_POOL_LOG_ENABLED') ? toBool(process.env.SQL_POOL_LOG_ENABLED) : true
    },
    Azure: {
      Scale: process.env.SQL_AZURE_SCALE
    }
  },
  Logging: {
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
    }
  },
  Environment: getEnvironment(),
  JwtSecret: process.env.JWT_SECRET || '0bd8fbdab903fb50455cb4cf7ba9fb5beed3f209687ed2644aa731ee8231e14c'
}
