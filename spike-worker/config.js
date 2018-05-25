'use strict'

require('dotenv').config()
const toBool = require('to-bool')

const oneMinuteInMilliseconds = 60000

module.exports = {
  Sql: {
    Database: process.env.SQL_DATABASE || 'mtc',
    Server: process.env.SQL_SERVER || 'localhost',
    Port: process.env.SQL_PORT || 1433,
    Timeout: process.env.SQL_TIMEOUT || oneMinuteInMilliseconds,
    Encrypt: process.env.hasOwnProperty('SQL_ENCRYPT') ? toBool(process.env.SQL_ENCRYPT) : true,
    Name: process.env.SQL_APP_NAME || 'mtc-local-dev', // docker default
    Username: process.env.SQL_APP_USER || 'mtcAdminUser', // docker default
    Password: process.env.SQL_APP_USER_PASSWORD || 'your-chosen*P4ssw0rd_for_dev_env!' // docker default
  }

}
