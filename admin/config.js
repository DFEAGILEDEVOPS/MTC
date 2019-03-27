'use strict'
require('dotenv').config()
const os = require('os')
const toBool = require('to-bool')

const twoMinutesInMilliseconds = 120000
const oneMinuteInMilliseconds = 60000

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
  Environment: getEnvironment(),
  GOOGLE_TRACKING_ID: process.env.GOOGLE_TRACKING_ID,
  LINES_PER_CHECK_FORM: getLinesPerCheck(),
  NCA_TOOLS_AUTH_URL: process.env.NCA_TOOLS_AUTH_URL,
  OVERRIDE_AVAILABILITY_CHECKS: false,
  OVERRIDE_AVAILABILITY_MIDDLEWARE: false,
  OverridePinExpiry: process.env.hasOwnProperty('OVERRIDE_PIN_EXPIRY') ? toBool(process.env.OVERRIDE_PIN_EXPIRY) : false,
  PORT: process.env.PORT || '3001',
  PUPIL_APP_URL: process.env.PUPIL_APP_URL,
  RESTART_MAX_ATTEMPTS: 2,
  SESSION_SECRET: process.env.NODE_ENV === 'production' ? process.env.SESSION_SECRET : 'anti tamper for dev',
  DEFAULT_TIMEZONE: 'Etc/UTC',
  WaitTimeBeforeExitInSeconds: parseInt(process.env.WAIT_TIME_BEFORE_EXIT, 10) || 30,
  Data: {
    allowedWords: process.env.ALLOWED_WORDS || 'aaa,bcd,dcd,tfg,bxx',
    pinSubmissionMaxAttempts: process.env.PIN_SUBMISSION_MAX_ATTEMPTS || 100,
    helplineNumber: process.env.HELPLINE_NUMBER || '0300 303 3013',
    pupilCensusMaxSizeFileUploadMb: process.env.PUPIL_CENSUS_MAX_FILE_UPLOAD_MB || 100 * 1024 * 1024,
    psychometricianReportMaxSizeFileUploadMb: process.env.PS_REPORT_MAX_FILE_UPLOAD_MB || 100 * 1024 * 1024
  },
  Sql: {
    Database: process.env.SQL_DATABASE || 'mtc',
    Server: process.env.SQL_SERVER || 'localhost',
    Port: process.env.SQL_PORT || 1433,
    Timeout: process.env.SQL_TIMEOUT || oneMinuteInMilliseconds,
    Encrypt: process.env.hasOwnProperty('SQL_ENCRYPT') ? toBool(process.env.SQL_ENCRYPT) : true,
    Application: {
      Name: process.env.SQL_APP_NAME || 'mtc-local-dev', // docker default
      Username: process.env.SQL_APP_USER || 'mtcAdminUser', // docker default
      Password: process.env.SQL_APP_USER_PASSWORD || 'your-chosen*P4ssw0rd_for_dev_env!' // docker default
    },
    Pooling: {
      MinCount: process.env.SQL_POOL_MIN_COUNT || 0,
      MaxCount: process.env.SQL_POOL_MAX_COUNT || 5,
      LoggingEnabled: process.env.hasOwnProperty('SQL_POOL_LOG_ENABLED') ? toBool(process.env.SQL_POOL_LOG_ENABLED) : false
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
    }
  },
  Logging: {
    LogLevel: process.env.LOG_LEVEL || 'info',
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
  Certificates: {
    Azure: {
      BlobContainer: process.env.CERT_BLOB_CONTAINER,
      NcaToolsPublicKeyName: process.env.CERT_NCATOOLS_PUBLIC_KEY_NAME,
      MtcPrivateKeyName: process.env.CERT_MTC_PRIVATE_KEY_NAME
    },
    Local: {
      NcaToolsPublicKey: process.env.TSO_AUTH_PUBLIC_KEY,
      MtcPrivateKey: process.env.MTC_AUTH_PRIVATE_KEY
    }
  },
  Cors: {
    Whitelist: process.env.CORS_WHITELIST || 'http://localhost:4200' // for development
  },
  Tokens: {
    // 12 hours default expiry
    jwtTimeOutHours: process.env.JWT_TIMEOUT_HOURS || 12,
    sasTimeOutHours: process.env.SAS_TIMEOUT_HOURS || 12
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
    Host: process.env.REDIS_HOST,
    Port: process.env.REDIS_PORT,
    Key: process.env.REDIS_KEY
  }
}
