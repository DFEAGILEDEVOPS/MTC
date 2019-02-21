'use strict'

require('dotenv').config()
const toBool = require('to-bool')

const twoMinutesInMilliseconds = 120000
const oneMinuteInMilliseconds = 60000

module.exports = {
  database: process.env.SQL_DATABASE || 'mtc',
  server: process.env.SQL_SERVER || 'localhost',
  port: process.env.SQL_PORT || 1433,
  requestTimeout: process.env.SQL_TIMEOUT || oneMinuteInMilliseconds,
  connectionTimeout: process.env.SQL_TIMEOUT || oneMinuteInMilliseconds,
  user: process.env.SQL_APP_USER || 'mtcAdminUser', // docker default
  password: process.env.SQL_APP_USER_PASSWORD || 'your-chosen*P4ssw0rd_for_dev_env!', // docker default
  pool: {
    min: process.env.SQL_POOL_MIN_COUNT || 100,
    max: process.env.SQL_POOL_MAX_COUNT || 200
  },
  options: {
    appName: process.env.SQL_APP_NAME || 'mtc-local-dev', // docker default
    encrypt: process.env.hasOwnProperty('SQL_ENCRYPT') ? toBool(process.env.SQL_ENCRYPT) : true
  }
}
