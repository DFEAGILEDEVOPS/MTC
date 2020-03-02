'use strict'

const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '..', '..', '..', '..', '.env')

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
const toBool = require('to-bool')

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
    min: parseInt(process.env.SQL_POOL_MIN_COUNT, 10) || 2,
    max: parseInt(process.env.SQL_POOL_MAX_COUNT, 10) || 10
  },
  options: {
    appName: process.env.SQL_APP_NAME || 'mtc-local-dev', // docker default
    encrypt: process.env.hasOwnProperty('SQL_ENCRYPT') ? toBool(process.env.SQL_ENCRYPT) : true
  }
}
