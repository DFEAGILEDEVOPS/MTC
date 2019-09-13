'use strict'

import 'dotenv/config'
import * as toBool from './lib/to-bool'

const getEnvironment = () => {
  return process.env.ENVIRONMENT_NAME || 'Local-Dev'
}

const oneMinuteInMilliseconds = 60000

function optionalValueParser (input: any, substitute: number): string {
  if (input) {
    return input
  }
  return substitute.toString()
}

export default {
  AzureStorageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  Environment: getEnvironment(),
  Redis: {
    Host: process.env.REDIS_HOST || 'localhost',
    Port: process.env.REDIS_PORT || 6379,
    Key: process.env.REDIS_KEY,
    useTLS: getEnvironment() === 'Local-Dev' ? false : true
  },
  Sql: {
    Database: process.env.SQL_DATABASE || 'mtc',
    Server: process.env.SQL_SERVER || 'localhost',
    Port: process.env.SQL_PORT || 1433,
    Timeout: process.env.SQL_TIMEOUT || oneMinuteInMilliseconds,
    requestTimeout: parseInt(optionalValueParser(process.env.SQL_REQUEST_TIMEOUT,oneMinuteInMilliseconds), 10),
    connectionTimeout: parseInt(optionalValueParser(process.env.SQL_CONNECTION_TIMEOUT, oneMinuteInMilliseconds), 10),
    Encrypt: process.env.hasOwnProperty('SQL_ENCRYPT') ? toBool.primitiveToBoolean(process.env.SQL_ENCRYPT) : true,
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
      MinCount: process.env.SQL_POOL_MIN_COUNT || 5,
      MaxCount: process.env.SQL_POOL_MAX_COUNT || 10,
      LoggingEnabled: process.env.hasOwnProperty('SQL_POOL_LOG_ENABLED') ? toBool.primitiveToBoolean(process.env.SQL_POOL_LOG_ENABLED) : true
    },
    Azure: {
      Scale: process.env.SQL_AZURE_SCALE
    }
  }
}
