'use strict'

import 'dotenv/config'
import * as toBool from 'to-bool'

const getEnvironment = () => {
  return process.env.ENVIRONMENT_NAME || 'Local-Dev'
}

export default {
  AzureStorageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  Environment: getEnvironment(),
  PORT: process.env.PORT || '3003',
  Cors: {
    Whitelist: process.env.CORS_WHITELIST || ''
  },
  Logging: {
    LogLevel: process.env.LOG_LEVEL || 'debug',
    Express: {
      UseWinston: process.env.hasOwnProperty('EXPRESS_LOGGING_WINSTON') ? toBool(process.env.EXPRESS_LOGGING_WINSTON) : false
    },
    ApplicationInsights: {
      LogToWinston: process.env.APPINSIGHTS_WINSTON_LOGGER || false,
      Key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY
    }
  }
}
