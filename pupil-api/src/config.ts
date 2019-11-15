'use strict'

import 'dotenv/config'
import * as toBool from 'to-bool'

const getEnvironment = () => {
  return process.env.ENVIRONMENT_NAME || 'Local-Dev'
}

function parseToInt (value: string | undefined, radix: number | undefined): number | boolean {
  if (value === undefined) return false
  const result = parseInt(value, radix)
  if (isNaN(result)) return false
  return result
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
  },
  Redis: {
    Host: process.env.REDIS_HOST || 'localhost',
    Port: process.env.REDIS_PORT || 6379,
    Key: process.env.REDIS_KEY,
    useTLS: getEnvironment() === 'Local-Dev' ? false : true
  },
  RateLimit: {
    Threshold: parseToInt(process.env.RATE_LIMIT_THRESHOLD,10) || 100,
    Duration: parseToInt(process.env.RATE_LIMIT_DURATION, 10) || 1000 * 60, // 1 minute in ms
    Enabled: process.env.hasOwnProperty('RATE_LIMIT_ENABLED') ? toBool(process.env.RATE_LIMIT_ENABLED) : false
  },
  RedisPreparedCheckExpiryInSeconds: parseInt(process.env.PREPARED_CHECK_EXPIRY_SECONDS, 10) || 1800
}
