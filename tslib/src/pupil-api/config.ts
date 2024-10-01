import * as os from 'os'
import * as path from 'path'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import * as parser from './helpers/parsing'
const globalDotEnvFile = path.join(__dirname, '..', '..', '.env')
try {
  if (fs.existsSync(globalDotEnvFile)) {
    console.log('globalDotEnvFile found', globalDotEnvFile)
    dotenv.config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}

const getEnvironment = (): string => {
  return process.env.ENVIRONMENT_NAME ?? 'Local-Dev'
}

function parseToInt (value: string | undefined, radix: number | undefined): number | undefined {
  if (value === undefined) return
  const result = parseInt(value, radix)
  if (isNaN(result)) return
  return result
}

export default {
  AzureStorageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  Environment: getEnvironment(),
  PORT: process.env.PORT ?? '3003',
  Cors: {
    Whitelist: process.env.CORS_WHITELIST ?? ''
  },
  Logging: {
    LogLevel: process.env.LOG_LEVEL ?? 'debug',
    Express: {
      UseWinston: parser.propertyExists(process.env, 'EXPRESS_LOGGING_WINSTON') ? parser.primitiveToBoolean(process.env.EXPRESS_LOGGING_WINSTON) : false
    },
    ApplicationInsights: {
      LogToWinston: process.env.APPINSIGHTS_WINSTON_LOGGER ?? false,
      Key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      ConnectionString: process.env.APPINSIGHTS_CONNECTION_STRING,
      CollectDependencies: parser.propertyExists(process.env, 'APPINSIGHTS_COLLECT_DEPENDENCIES') ? parser.primitiveToBoolean(process.env.APPINSIGHTS_COLLECT_DEPENDENCIES) : true,
      InstanceId: `${os.hostname()}:${process.pid}`,
      CollectExceptions: parser.propertyExists(process.env, 'APPINSIGHTS_COLLECT_EXCEPTIONS') ? parser.primitiveToBoolean(process.env.APPINSIGHTS_COLLECT_EXCEPTIONS) : true,
      LiveMetrics: parser.propertyExists(process.env, 'APPINSIGHTS_LIVE_METRICS') ? parser.primitiveToBoolean(process.env.APPINSIGHTS_LIVE_METRICS) : true
    }
  },
  Redis: {
    Host: process.env.REDIS_HOST ?? 'localhost',
    Port: parseToInt(process.env.REDIS_PORT, 10) ?? 6379,
    Key: process.env.REDIS_KEY,
    useTLS: getEnvironment() !== 'Local-Dev'
  },
  RedisPreparedCheckExpiryInSeconds: parseToInt(process.env.PREPARED_CHECK_EXPIRY_SECONDS, 10) ?? 1800,
  FeatureToggles: {},
  ServiceBus: {
    connectionString: process.env.AZURE_SERVICE_BUS_CONNECTION_STRING
  }
}
