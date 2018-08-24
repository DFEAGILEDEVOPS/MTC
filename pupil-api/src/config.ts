'use strict'

import 'dotenv/config'
import * as toBool from 'to-bool'

const getEnvironment = () => {
  return process.env.ENVIRONMENT_NAME || 'Local-Dev'
}

export = {
  PORT: process.env.PORT || '3003',
  Logging: {
    Express: {
      UseWinston: process.env.hasOwnProperty('EXPRESS_LOGGING_WINSTON') ? toBool(process.env.EXPRESS_LOGGING_WINSTON) : false
    }
  },
  Environment: getEnvironment(),
  AzureStorageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING
}
