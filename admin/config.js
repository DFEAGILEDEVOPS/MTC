'use strict'
const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '.env')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}
const os = require('os')
const toBool = require('to-bool')
const sql = require('./config/sql.config')
const twoMinutesInMilliseconds = 120000
const thirtySecondsInMilliseconds = 30000
const authModes = require('./lib/consts/auth-modes')

const getEnvironment = () => {
  return process.env.ENVIRONMENT_NAME || 'Local-Dev'
}

const getLinesPerCheck = () => {
  const defaultValue = 25
  const val = process.env.LINES_PER_CHECK_FORM
  const parsed = parseInt(val, 10)
  if (isNaN(parsed)) return defaultValue
  if (parsed < 1) return defaultValue
  return parsed
}

module.exports = {
  ADMIN_SESSION_DISPLAY_NOTICE_AFTER: (process.env.ADMIN_SESSION_DISPLAY_NOTICE_AFTER || 5) * 60, // Display notice after 5 minutes by default
  ADMIN_SESSION_EXPIRATION_TIME_IN_SECONDS: (process.env.ADMIN_SESSION_EXPIRATION_TIME_IN_SECONDS || 10) * 60, // Expire after 10 minutes inactivity by default
  AssetPath: process.env.ASSET_PATH || '/',
  AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING,
  CHECK_FORM_MAX_FILES_PER_UPLOAD: 10,
  CHECK_FORM_MAX_INTEGER: 12,
  CHECK_FORM_MIN_INTEGER: 1,
  CHECK_FORM_NAME_MAX_CHARACTERS: 128,
  DEFAULT_TIMEZONE: 'Europe/London',
  Environment: getEnvironment(),
  GOOGLE_TRACKING_ID: process.env.GOOGLE_TRACKING_ID,
  LINES_PER_CHECK_FORM: getLinesPerCheck(),
  OVERRIDE_AVAILABILITY_CHECKS: false,
  OVERRIDE_AVAILABILITY_MIDDLEWARE: false,
  OverridePinExpiry: {}.hasOwnProperty.call(process.env, 'OVERRIDE_PIN_EXPIRY') ? toBool(process.env.OVERRIDE_PIN_EXPIRY) : false,
  OverridePinValidFrom: {}.hasOwnProperty.call(process.env, 'OVERRIDE_PIN_VALIDITY_TIME') ? toBool(process.env.OVERRIDE_PIN_VALIDITY_TIME) : false,
  PORT: process.env.PORT || '3001',
  prepareCheckMessageBatchSize: {}.hasOwnProperty.call(process.env, 'PREPARE_CHECK_MESSAGE_BATCH_SIZE') ? parseInt(process.env.PREPARE_CHECK_MESSAGE_BATCH_SIZE, 10) : 5,
  PUPIL_APP_URL: process.env.PUPIL_APP_URL,
  PupilAppUseCompression: {}.hasOwnProperty.call(process.env, 'PUPIL_APP_USE_COMPRESSION') ? toBool(process.env.PUPIL_APP_USE_COMPRESSION) : true,
  RESTART_MAX_ATTEMPTS: 2,
  SESSION_SECRET: process.env.NODE_ENV === 'production' ? process.env.SESSION_SECRET : 'anti tamper for dev',
  WEBSITE_OFFLINE: {}.hasOwnProperty.call(process.env, 'WEBSITE_OFFLINE') ? toBool(process.env.WEBSITE_OFFLINE) : false,
  WaitTimeBeforeExitInSeconds: parseInt(process.env.WAIT_TIME_BEFORE_EXIT, 10) || 30,
  WaitTimeBeforeMetaRedirectInSeconds: parseInt(process.env.WAIT_TIME_BEFORE_REDIRECT, 10) || 2,
  Data: {
    allowedWords: process.env.ALLOWED_WORDS || 'aaa,bcd,dcd,tfg,bxx',
    pinSubmissionMaxAttempts: process.env.PIN_SUBMISSION_MAX_ATTEMPTS || 100,
    helplineNumber: process.env.HELPLINE_NUMBER || '0300 303 3013',
    pupilCensusMaxSizeFileUploadMb: process.env.PUPIL_CENSUS_MAX_FILE_UPLOAD_MB || 100 * 1024 * 1024,
    psychometricianReportMaxSizeFileUploadMb: process.env.PS_REPORT_MAX_FILE_UPLOAD_MB || 100 * 1024 * 1024
  },
  Sql: {
    Database: sql.database,
    Server: sql.server,
    Port: sql.port,
    // DEPRECATED - misused across both request and connection timeouts
    Timeout: parseInt(process.env.SQL_TIMEOUT, 10) || thirtySecondsInMilliseconds,
    requestTimeout: sql.requestTimeout,
    connectionTimeout: sql.connectionTimeout,
    Encrypt: sql.options.encrypt,
    Application: {
      Name: sql.options.appName,
      Username: sql.user,
      Password: sql.password
    },
    Pooling: {
      MinCount: sql.pool.min,
      MaxCount: sql.pool.max,
      // DEPRECATED - not supported in MSSQL
      LoggingEnabled: {}.hasOwnProperty.call(process.env, 'SQL_POOL_LOG_ENABLED') ? toBool(process.env.SQL_POOL_LOG_ENABLED) : false
    },
    Migrator: {
      Username: process.env.SQL_ADMIN_USER || 'sa', // docker default
      Password: process.env.SQL_ADMIN_USER_PASSWORD || 'Mtc-D3v.5ql_S3rv3r', // docker default
      Timeout: parseInt(process.env.SQL_MIGRATION_TIMEOUT, 10) || twoMinutesInMilliseconds
    },
    PupilCensus: {
      Username: process.env.SQL_PUPIL_CENSUS_USER || 'CensusImportUser',
      Password: process.env.SQL_PUPIL_CENSUS_USER_PASSWORD
    },
    Azure: {
      Scale: process.env.SQL_AZURE_SCALE
    },
    AllowReadsFromReplica: {}.hasOwnProperty.call(process.env, 'SQL_ALLOW_REPLICA_FOR_READS') ? toBool(process.env.SQL_ALLOW_REPLICA_FOR_READS) : false
  },
  DatabaseRetry: {
    MaxRetryAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS, 10) || 3,
    InitialPauseMs: parseInt(process.env.RETRY_PAUSE_MS, 10) || 5000,
    PauseMultiplier: parseFloat(process.env.RETRY_PAUSE_MULTIPLIER) || 1.5
  },
  Logging: {
    LogLevel: process.env.LOG_LEVEL || 'info',
    DebugVerbosity: {}.hasOwnProperty.call(process.env, 'DEBUG_VERBOSITY') ? parseInt(process.env.DEBUG_VERBOSITY, 10) : 1,
    LogDna: {
      key: process.env.LOGDNA_API_KEY,
      hostname: `${os.hostname()}:${process.pid}`,
      ip: undefined,
      mac: undefined,
      app: `MTCAdmin:${getEnvironment()}`,
      env: `${getEnvironment()}`
    },
    Express: {
      UseWinston: process.env.EXPRESS_LOGGING_WINSTON || false
    },
    SendToAppInsights: process.env.APPINSIGHTS_WINSTON_LOGGER || false
  },
  Tokens: {
    // 12 hours default expiry
    jwtTimeOutHours: process.env.JWT_TIMEOUT_HOURS || 12,
    sasTimeOutHours: process.env.SAS_TIMEOUT_HOURS || 25
  },
  Azure: {
    queuePrefix: process.env.AZURE_QUEUE_PREFIX || '',
    tablePrefix: process.env.AZURE_TABLE_PREFIX || ''
  },
  Monitoring: {
    ApplicationInsights: {
      Key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      CollectDependencies: process.env.APPINSIGHTS_COLLECT_DEPS || true,
      CollectExceptions: process.env.APPINSIGHTS_COLLECT_EXCEPTIONS || true
    }
  },
  Redis: {
    Host: process.env.REDIS_HOST || 'localhost',
    Port: process.env.REDIS_PORT || 6379,
    Key: process.env.REDIS_KEY,
    useTLS: getEnvironment() !== 'Local-Dev'
  },
  Auth: {
    mode: process.env.AUTH_MODE || authModes.local, // see ./lib/consts/auth-modes.js for valid options
    dfeSignIn: {
      authUrl: process.env.DFE_SIGNON_AUTH_URL,
      clientId: process.env.DFE_SIGNON_CLIENT_ID,
      clientSecret: process.env.DFE_SIGNON_CLIENT_SECRET,
      clockToleranceSeconds: process.env.DFE_SIGNON_CLOCK_TOLERANCE_SECONDS || 300,
      issuerDiscoveryTimeoutMs: process.env.DFE_SIGNON_DISCOVERY_TIMEOUT_MS || 10000,
      openIdScope: process.env.DFE_SIGNON_OPENID_SCOPE || 'openid profile email organisation',
      userInfoApi: {
        baseUrl: process.env.DFE_USER_INFO_API_URL,
        apiSecret: process.env.DFE_USER_INFO_API_SECRET,
        audience: process.env.DFE_USER_INFO_API_TOKEN_AUDIENCE || 'signin.education.gov.uk'
      },
      signOutUrl: process.env.DFE_SIGNON_SIGNOUT_URL
    }
  },
  Runtime: {
    externalHost: process.env.RUNTIME_EXTERNAL_HOST || 'http://localhost:3001'
  },
  ServiceBus: {
    connectionString: process.env.AZURE_SERVICE_BUS_CONNECTION_STRING
  },
  FeatureToggles: {
    accessArrangements: {}.hasOwnProperty.call(process.env, 'FEATURE_TOGGLE_ACCESS_ARRANGEMENTS') ? toBool(process.env.FEATURE_TOGGLE_ACCESS_ARRANGEMENTS) : true,
    groupCreate: {}.hasOwnProperty.call(process.env, 'FEATURE_TOGGLE_GROUP_CREATE') ? toBool(process.env.FEATURE_TOGGLE_GROUP_CREATE) : true,
    groupEdit: {}.hasOwnProperty.call(process.env, 'FEATURE_TOGGLE_GROUP_EDIT') ? toBool(process.env.FEATURE_TOGGLE_GROUP_EDIT) : true,
    groupRemove: {}.hasOwnProperty.call(process.env, 'FEATURE_TOGGLE_GROUP_REMOVE') ? toBool(process.env.FEATURE_TOGGLE_GROUP_REMOVE) : true,
    newCheckForm: {}.hasOwnProperty.call(process.env, 'FEATURE_TOGGLE_NEW_CHECK_FORM') ? toBool(process.env.FEATURE_TOGGLE_NEW_CHECK_FORM) : true,
    newCheckWindow: {}.hasOwnProperty.call(process.env, 'FEATURE_TOGGLE_NEW_CHECK_WINDOW') ? toBool(process.env.FEATURE_TOGGLE_NEW_CHECK_WINDOW) : true,
    pupilEdit: {}.hasOwnProperty.call(process.env, 'FEATURE_TOGGLE_PUPIL_EDIT') ? toBool(process.env.FEATURE_TOGGLE_PUPIL_EDIT) : true,
    schoolHomeViewV2: {}.hasOwnProperty.call(process.env, 'FEATURE_TOGGLE_SCHOOL_HOME_VIEW_V2') ? toBool(process.env.FEATURE_TOGGLE_SCHOOL_HOME_VIEW_V2) : true
  }
}
