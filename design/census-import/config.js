'use strict'
require('dotenv').config()
const toBool = require('to-bool')

const oneMinuteInMilliseconds = 60000

module.exports = {
  Logging: {
    LogLevel: process.env.LOG_LEVEL || 'info',
    SendToAppInsights: process.env.APPINSIGHTS_WINSTON_LOGGER || false
  },
  Monitoring: {
    ApplicationInsights: {
      Key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      CollectDependencies: process.env.APPINSIGHTS_COLLECT_DEPS || true,
      CollectExceptions: process.env.APPINSIGHTS_COLLECT_EXCEPTIONS || true
    }
  },
  Sql: {
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
      MinCount: process.env.SQL_POOL_MIN_COUNT || 100,
      MaxCount: process.env.SQL_POOL_MAX_COUNT || 200,
      LoggingEnabled: process.env.hasOwnProperty('SQL_POOL_LOG_ENABLED') ? toBool(process.env.SQL_POOL_LOG_ENABLED) : false
    }
  }
}
