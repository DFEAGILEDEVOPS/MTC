import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import * as parser from './common/parsing'
import * as schoolResultsCacheDeterminerConfig from './functions/school-results-cache-determiner/config'
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
  return parser.valueOrSubstitute(process.env.ENVIRONMENT_NAME, 'Local-Dev')
}

const oneMinuteInMilliseconds = 60000
const tenMinutesInMilliseconds = oneMinuteInMilliseconds * 10
const twoHoursInMilliseconds = oneMinuteInMilliseconds * 120
const sixMonthsInSeconds = 15778800

export default {
  Environment: getEnvironment(),
  Sql: {
    user: process.env.SQL_FUNCTIONS_APP_USER,
    password: process.env.SQL_FUNCTIONS_APP_USER_PASSWORD,
    server: process.env.SQL_SERVER ?? 'localhost',
    port: parseInt(parser.valueOrSubstitute(process.env.SQL_PORT, 1433), 10),
    database: process.env.SQL_DATABASE ?? 'mtc',
    connectionTimeout: parseInt(parser.valueOrSubstitute(process.env.SQL_CONNECTION_TIMEOUT, oneMinuteInMilliseconds), 10),
    censusRequestTimeout: parseInt(parser.valueOrSubstitute(process.env.SQL_CENSUS_REQUEST_TIMEOUT, twoHoursInMilliseconds), 10),
    requestTimeout: parseInt(parser.valueOrSubstitute(process.env.SQL_REQUEST_TIMEOUT, tenMinutesInMilliseconds), 10),
    options: {
      encrypt: parser.propertyExists(process.env, 'SQL_ENCRYPT') ? parser.primitiveToBoolean(process.env.SQL_ENCRYPT) : true,
      useUTC: true,
      appName: parser.valueOrSubstitute(process.env.SQL_APP_NAME, 'mtc-functions'), // docker default
      enableArithAbort: parser.propertyExists(process.env, 'SQL_ENABLE_ARITH_ABORT') ? parser.primitiveToBoolean(process.env.SQL_ENABLE_ARITH_ABORT) : true
    },
    Pooling: {
      MinCount: Number(parser.valueOrSubstitute(process.env.SQL_POOL_MIN_COUNT, 5)),
      MaxCount: Number(parser.valueOrSubstitute(process.env.SQL_POOL_MAX_COUNT, 10)),
      LoggingEnabled: parser.propertyExists(process.env, 'SQL_POOL_LOG_ENABLED') ? parser.primitiveToBoolean(process.env.SQL_POOL_LOG_ENABLED) : true
    },
    PupilCensus: {
      Username: process.env.SQL_PUPIL_CENSUS_USER ?? 'CensusImportUser',
      Password: process.env.SQL_PUPIL_CENSUS_USER_PASSWORD
    }
  },
  DatabaseRetry: {
    MaxRetryAttempts: parseInt(parser.valueOrSubstitute(process.env.RETRY_MAX_ATTEMPTS, 3), 10),
    InitialPauseMs: parseInt(parser.valueOrSubstitute(process.env.RETRY_PAUSE_MS, 5000), 10),
    PauseMultiplier: parseFloat(parser.valueOrSubstitute(process.env.RETRY_PAUSE_MULTIPLIER, 1.5))
  },
  Redis: {
    Host: process.env.REDIS_HOST ?? 'localhost',
    Port: Number(parser.valueOrSubstitute(process.env.REDIS_PORT, 6379)),
    Key: process.env.REDIS_KEY,
    useTLS: getEnvironment() !== 'Local-Dev'
  },
  CheckAllocation: {
    ExpiryTimeInSeconds: Number(parser.valueOrSubstitute(process.env.CHECK_ALLOCATION_EXPIRY_SECONDS, 15778476)) // 6 months
  },
  PupilAuth: {
    PreparedCheckExpiryAfterLoginSeconds: parseInt(parser.valueOrSubstitute(process.env.PREPARED_CHECK_EXPIRY_SECONDS, 1800), 10),
    CorsWhitelist: process.env.CORS_WHITELIST ?? ''
  },
  ServiceBus: {
    ConnectionString: process.env.AZURE_SERVICE_BUS_CONNECTION_STRING,
    // CheckCompletionQueueMaxDeliveryCount can be removed when we can query this value dynamically
    CheckCompletionQueueMaxDeliveryCount: parseInt(parser.valueOrSubstitute(process.env.CHECK_COMPLETION_QUEUE_MAX_DELIVERY_COUNT, 10), 10)
  },
  CheckNotifier: {
    MessagesPerBatch: parseInt(parser.valueOrSubstitute(process.env.CHECK_NOTIFIER_MESSAGES_PER_BATCH, 32), 10),
    BatchesPerExecution: parseInt(parser.valueOrSubstitute(process.env.CHECK_NOTIFIER_BATCH_COUNT, 5), 10)
  },
  SchoolPinGenerator: {
    AllowedWords: process.env.ALLOWED_WORDS ?? 'aaa,bbb,ccc,ddd,eee,dim',
    BannedWords: process.env.BANNED_WORDS ?? 'dim',
    OverridePinExpiry: parser.propertyExists(process.env, 'OVERRIDE_PIN_EXPIRY') ? parser.primitiveToBoolean(process.env.OVERRIDE_PIN_EXPIRY) : false,
    PinUpdateMaxAttempts: parseInt(parser.valueOrSubstitute(process.env.PIN_UPDATE_MAX_ATTEMPTS, 0), 10),
    DigitChars: '23456789'
  },
  Gias: {
    Namespace: process.env.GIAS_WS_NAMESPACE,
    ServiceUrl: process.env.GIAS_WS_SERVICE_URL,
    MessageExpiryInMilliseconds: parseInt(parser.valueOrSubstitute(process.env.GIAS_WS_MESSAGE_EXPIRY_MS, 10000), 10),
    RequestTimeoutInMilliseconds: parseInt(parser.valueOrSubstitute(process.env.GIAS_WS_REQUEST_TIMEOUT, 30000), 10),
    Username: process.env.GIAS_WS_USERNAME,
    Password: process.env.GIAS_WS_PASSWORD,
    ExtractId: parseInt(parser.valueOrSubstitute(process.env.GIAS_WS_EXTRACT_ID, 0), 10)
  },
  SchoolResultsCacheDeterminer: {
    cache: Number(parser.valueOrSubstitute(process.env.SCHOOL_RESULTS_CACHE, schoolResultsCacheDeterminerConfig.cache.cacheIfInDate))
  },
  SchoolResultsCache: {
    BatchesPerExecution: Number(parser.valueOrSubstitute(process.env.SCHOOL_RESULTS_CACHE_BATCHS_PER_EXEC, 10)),
    MessagesPerBatch: Number(parser.valueOrSubstitute(process.env.SCHOOL_RESULTS_CACHE_MSGS_PER_BATCH, 32)),
    RedisResultsExpiryInSeconds: Number(parser.valueOrSubstitute(process.env.REDIS_RESULTS_EXPIRY_IN_SECONDS, sixMonthsInSeconds))
  },
  AzureStorage: {
    ConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING ?? ''
  },
  DevTestUtils: {
    TestSupportApi: parser.propertyExists(process.env, 'TEST_SUPPORT_API_ENABLED') ? parser.primitiveToBoolean(process.env.TEST_SUPPORT_API_ENABLED) : false
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
