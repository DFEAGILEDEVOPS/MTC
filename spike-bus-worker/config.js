'use strict'

require('dotenv').config()
const toBool = require('to-bool')

const twoMinutesInMilliseconds = 120000

module.exports = {
  Sql: {
    Database: process.env.SQL_DATABASE || 'mtc',
    Server: process.env.SQL_SERVER || 'localhost',
    Port: process.env.SQL_PORT || 1433,
    Timeout: process.env.SQL_MIGRATION_TIMEOUT || twoMinutesInMilliseconds,
    Encrypt: process.env.hasOwnProperty('SQL_ENCRYPT') ? toBool(process.env.SQL_ENCRYPT) : true,
    Name: process.env.SQL_APP_NAME || 'mtc-local-dev', // docker default
    Username: process.env.SQL_ADMIN_USER || 'sa', // docker default
    Password: process.env.SQL_ADMIN_USER_PASSWORD || 'Mtc-D3v.5ql_S3rv3r' // docker default
  }

}
