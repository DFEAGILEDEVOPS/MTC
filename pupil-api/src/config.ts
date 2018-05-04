'use strict'

import 'dotenv/config'
import * as toBool from 'to-bool'

const oneMinuteInMilliseconds = 60000
const twoMinutesInMilliseconds = 120000

const getEnvironment = () => {
  return process.env.ENVIRONMENT_NAME || 'Local-Dev'
}

export = {
  PORT: process.env.PORT || '3003',
  // autoMark true | false - Automatically mark the check data when we receive it: boolean
  autoMark: process.env.hasOwnProperty('AUTO_MARK') ? toBool(process.env.AUTO_MARK) : true,
  Sql: {
    DefaultSchema: process.env.SQL_SCHEMA || '[mtc_check]',
    Database: process.env.SQL_DATABASE || 'mtcPupil',
    Server: process.env.SQL_SERVER || 'localhost',
    Port: process.env.SQL_PORT || 1433,
    Timeout: process.env.SQL_TIMEOUT || oneMinuteInMilliseconds,
    Encrypt: process.env.hasOwnProperty('SQL_ENCRYPT') ? toBool(process.env.SQL_ENCRYPT) : true,
    Application: {
      Name: process.env.SQL_APP_NAME || 'mtc-pupil-api-local',
      Username: process.env.SQL_APP_USER || 'mtcAdminUser', // docker default
      Password: process.env.SQL_APP_USER_PASSWORD || 'your-chosen*P4ssw0rd_for_dev_env!' // docker default
    },
    Pooling: {
      MinCount: process.env.SQL_POOL_MIN_COUNT || 5,
      MaxCount: process.env.SQL_POOL_MAX_COUNT || 10,
      LoggingEnabled: process.env.hasOwnProperty('SQL_POOL_LOG_ENABLED') ? toBool(process.env.SQL_POOL_LOG_ENABLED) : true
    },
    Migrator: {
      Username: process.env.SQL_ADMIN_USER || 'sa', // docker default
      Password: process.env.SQL_ADMIN_USER_PASSWORD || 'Mtc-D3v.5ql_S3rv3r', // docker default
      Timeout: process.env.SQL_MIGRATION_TIMEOUT || twoMinutesInMilliseconds
    },
    Azure: {
      Scale: process.env.SQL_AZURE_SCALE
    }
  },
  Logging: {
    Express: {
      UseWinston: process.env.EXPRESS_LOGGING_WINSTON || false
    }
  },
  Environment: getEnvironment(),
  JwtSecret: process.env.JWT_SECRET || 'dev-token'.padEnd(64, '-'),
  Endpoints: {
    Auth: process.env.API_AUTH || false,
    CheckStart: process.env.API_CHECK_START || false,
    CheckSubmit: process.env.API_CHECK_SUBMIT || false,
    Feedback: process.env.API_FEEDBACK || false
  }
}
