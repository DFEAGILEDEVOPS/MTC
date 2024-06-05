import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import * as parser from './common/parsing'

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

const getLinesPerCheck = (): number => {
  const defaultValue = 25
  const val = process.env.LIVE_FORM_QUESTION_COUNT
  if (val === undefined) return defaultValue
  const parsed = parseInt(val, 10)
  if (isNaN(parsed)) return defaultValue
  if (parsed < 1) return defaultValue
  return parsed
}

const oneMinuteInMilliseconds = 60000
const twoHoursInMilliseconds = oneMinuteInMilliseconds * 120

export default {
  Environment: getEnvironment(),
  Sql: {
    user: parser.valueOrSubstitute(process.env.SQL_FUNCTIONS_APP_USER, 'functionsAppSystemUser'),
    password: parser.valueOrSubstitute(process.env.SQL_FUNCTIONS_APP_USER_PASSWORD, 'functionsAppSystemP4ssw0rd!'),
    server: process.env.SQL_SERVER ?? 'localhost',
    port: parseInt(parser.valueOrSubstitute(process.env.SQL_PORT, 1433), 10),
    database: process.env.SQL_DATABASE ?? 'mtc',
    connectionTimeout: parseInt(parser.valueOrSubstitute(process.env.SQL_CONNECTION_TIMEOUT, oneMinuteInMilliseconds), 10),
    censusRequestTimeout: parseInt(parser.valueOrSubstitute(process.env.SQL_CENSUS_REQUEST_TIMEOUT, twoHoursInMilliseconds), 10),
    requestTimeout: parseInt(parser.valueOrSubstitute(process.env.SQL_REQUEST_TIMEOUT, oneMinuteInMilliseconds), 10),
    options: {
      encrypt: parser.propertyExists(process.env, 'SQL_ENCRYPT') ? parser.primitiveToBoolean(process.env.SQL_ENCRYPT) : true,
      useUTC: true,
      appName: parser.valueOrSubstitute(process.env.SQL_APP_NAME, 'mtc-functions'), // docker default
      enableArithAbort: parser.propertyExists(process.env, 'SQL_ENABLE_ARITH_ABORT') ? parser.primitiveToBoolean(process.env.SQL_ENABLE_ARITH_ABORT) : true,
      // We should check the server certificate, rather than blindly trust it.
      trustServerCertificate: {}.hasOwnProperty.call(process.env, 'SQL_TRUST_SERVER_CERTIFICATE') ? parser.primitiveToBoolean(process.env.SQL_TRUST_SERVER_CERTIFICATE) : false
    },
    Pooling: {
      MinCount: Number(parser.valueOrSubstitute(process.env.SQL_POOL_MIN_COUNT, 5)),
      MaxCount: Number(parser.valueOrSubstitute(process.env.SQL_POOL_MAX_COUNT, 10)),
      LoggingEnabled: parser.propertyExists(process.env, 'SQL_POOL_LOG_ENABLED') ? parser.primitiveToBoolean(process.env.SQL_POOL_LOG_ENABLED) : true
    },
    PupilCensus: {
      Username: process.env.SQL_PUPIL_CENSUS_USER ?? 'CensusImportUser',
      Password: process.env.SQL_PUPIL_CENSUS_USER_PASSWORD
    },
    LocalAdmin: {
      // User and password for the local docker instance on local dev environments.
      user: process.env.SQL_LOCAL_ADMIN_USER,
      password: process.env.SQL_LOCAL_ADMIN_PASS
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
  PupilApi: {
    PreparedCheckExpiryAfterLoginSeconds: parseInt(parser.valueOrSubstitute(process.env.PREPARED_CHECK_EXPIRY_SECONDS, 1800), 10),
    CorsWhitelist: process.env.CORS_WHITELIST ?? '',
    JwtSecret: process.env.CHECK_SUBMIT_JWT_SECRET ?? ''
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
  AzureStorage: {
    ConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING ?? ''
  },
  DevTestUtils: {
    TestSupportApi: parser.propertyExists(process.env, 'TEST_SUPPORT_API_ENABLED') ? parser.primitiveToBoolean(process.env.TEST_SUPPORT_API_ENABLED) : false,
    // prevents the check started function from dropping the prepared check.  This is useful in load test scenarios when the util-submit-check function is used
    DisablePreparedCheckCacheDrop: parser.propertyExists(process.env, 'TEST_SUPPORT_DISABLE_PREPARED_CHECK_CACHE_DROP') ? parser.primitiveToBoolean(process.env.TEST_SUPPORT_DISABLE_PREPARED_CHECK_CACHE_DROP) : false
  },
  ApplicationInsights: {
    Key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
    InstanceId: `${os.hostname()}:${process.pid}`,
    CollectExceptions: parser.propertyExists(process.env, 'APPINSIGHTS_COLLECT_EXCEPTIONS') ? parser.primitiveToBoolean(process.env.APPINSIGHTS_COLLECT_EXCEPTIONS) : true,
    LiveMetrics: parser.propertyExists(process.env, 'APPINSIGHTS_LIVE_METRICS') ? parser.primitiveToBoolean(process.env.APPINSIGHTS_LIVE_METRICS) : true
  },
  Logging: {
    DebugVerbosity: parseInt(parser.valueOrSubstitute(process.env.DEBUG_VERBOSITY, 1), 10)
  },
  RemoteIpCheckUrl: process.env.REMOTE_IP_CHECK_URL,
  SyncResultsInit: {
    MaxParallelTasks: parseInt(parser.valueOrSubstitute(process.env.SYNC_RESULTS_INIT_MAX_PARALLEL_TASKS, 5), 10)
  },
  LiveFormQuestionCount: getLinesPerCheck(),
  PsReport: {
    StagingFile: {
      ReadMessagesPerBatch: parseInt(parser.valueOrSubstitute(process.env.PS_REPORT_STAGING_READ_MESSAGE_BATCH_SIZE, 32), 10),
      WriteMessagesPerBatch: parseInt(parser.valueOrSubstitute(process.env.PS_REPORT_STAGING_WRITE_MESSAGE_BATCH_SIZE, 32), 10), // 32 x 32 = 1024 csv rows written per write
      WaitTimeToTriggerStagingComplete: parseInt(parser.valueOrSubstitute(process.env.PS_REPORT_STAGING_WAIT_TIME_COMPLETE, 600), 10), // 600 seconds = 10 * 60 = 10 minutes
      PollInterval: parseInt(parser.valueOrSubstitute(process.env.PS_REPORT_STAGING_POLL_INTERVAL, 10), 10) // Default is 10 milliseconds between polls when writing to the CSV file.
    },
    ListSchools: {
      PercentLeftToStartStaging: parseInt(parser.valueOrSubstitute(process.env.PS_REPORT_LIST_SCHOOLS_START_STAGING_PERCENT_LEFT, 5), 10) // default is to start staging when 5% messages are left on the ps-report-schools queue.
    }
  }
}
