'use strict'
const os = require('os')
const toBool = require('to-bool')

const twoMinutesInMilliseconds = 120000
const oneMinuteInMilliseconds = 60000

const getEnvironment = () => {
  return process.env.ENVIRONMENT_NAME || 'Local-Dev'
}

module.exports = {
  AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING,
  AZURE_STORAGE_LOGGING_ENABLED: process.env.AZURE_STORAGE_LOGGING_ENABLED,
  GOOGLE_TRACKING_ID: process.env.GOOGLE_TRACKING_ID,
  MONGO_CONNECTION_STRING: process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost/mtc',
  MTC_SERVICE: process.env.MTC_SERVICE,
  NCA_TOOLS_AUTH_URL: process.env.NCA_TOOLS_AUTH_URL,
  PORT: process.env.PORT || '3001',
  PUPIL_APP_URL: process.env.PUPIL_APP_URL,
  QUESTION_TIME_LIMIT: 5,
  RESTART_MAX_ATTEMPTS: 2,
  SESSION_SECRET: process.env.NODE_ENV === 'production' ? process.env.SESSION_SECRET : 'anti tamper for dev',
  TIME_BETWEEN_QUESTIONS: 2,
  LINES_PER_CHECK_FORM: 25,
  // autoMark true | false - Automatically mark the check data when we receive it: boolean
  autoMark: process.env.hasOwnProperty('AUTO_MARK') ? toBool(process.env.AUTO_MARK) : true,
  Data: {
    allowedWords: process.env.ALLOWED_WORDS || 'aaa,bcd,dcd,tfg,bxx',
    pinSubmissionMaxAttempts: process.env.PIN_SUBMISSION_MAX_ATTEMPTS || 100
  },
  Sql: {
    Enabled: true, // deprecated, to be removed
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
      MinCount: process.env.SQL_POOL_MIN_COUNT || 5,
      MaxCount: process.env.SQL_POOL_MAX_COUNT || 10,
      LoggingEnabled: process.env.hasOwnProperty('SQL_POOL_LOG_ENABLED') ? toBool(process.env.SQL_POOL_LOG_ENABLED) : true
    },
    Migrator: {
      Username: process.env.SQL_ADMIN_USER || 'sa', // docker default
      Password: process.env.SQL_ADMIN_USER_PASSWORD || 'Mtc-D3v.5ql_S3rv3r', // docker default
      Timeout: process.env.SQL_MIGRATION_TIMEOUT || twoMinutesInMilliseconds,
      WaitTime: process.env.SQL_MIGRATION_WAIT_TIME || 0
    },
    Azure: {
      Scale: process.env.SQL_AZURE_SCALE
    }
  },
  Logging: {
    LogDna: {
      key: process.env.LOGDNA_API_KEY,
      hostname: `${os.hostname()}:${process.pid}`,
      ip: undefined,
      mac: undefined,
      app: `MTCAdmin:${getEnvironment()}`,
      env: `${getEnvironment()}`
    }
  },
  OverridePinExpiry: process.env.hasOwnProperty('OVERRIDE_PIN_EXPIRY') ? toBool(process.env.OVERRIDE_PIN_EXPIRY) : false,
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
  Environment: getEnvironment() // process.env.ENVIRONMENT_NAME || 'Local-Dev'
}
