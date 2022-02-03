import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import * as parser from './check-started/parsing'
const globalDotEnvFile = path.join(__dirname, '..', '.env')
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
  return parser.valueOrSubstitute(process.env.ENVIRONMENT_NAME, 'Local-Dev')
}

const oneMinuteInMilliseconds = 60000
const twoHoursInMilliseconds = oneMinuteInMilliseconds * 120
const sixMonthsInSeconds = 15778800

export default {
  Environment: getEnvironment(),
  Redis: {
    Host: process.env.REDIS_HOST ?? 'localhost',
    Port: Number(parser.valueOrSubstitute(process.env.REDIS_PORT, 6379)),
    Key: process.env.REDIS_KEY,
    useTLS: getEnvironment() !== 'Local-Dev'
  },
  AzureStorage: {
    ConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING ?? ''
  },
  ApplicationInsights: {
    Key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
    InstanceId: `${os.hostname()}:${process.pid}`,
    CollectExceptions: parser.propertyExists(process.env, 'APPINSIGHTS_COLLECT_EXCEPTIONS') ? parser.primitiveToBoolean(process.env.APPINSIGHTS_COLLECT_EXCEPTIONS) : true,
    LiveMetrics: parser.propertyExists(process.env, 'APPINSIGHTS_LIVE_METRICS') ? parser.primitiveToBoolean(process.env.APPINSIGHTS_LIVE_METRICS) : true
  },
  Logging: {
    DebugVerbosity: parseInt(parser.valueOrSubstitute(process.env.DEBUG_VERBOSITY, 1), 10)
  }
}
