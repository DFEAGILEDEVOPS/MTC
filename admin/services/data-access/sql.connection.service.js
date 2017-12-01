'use strict'

var ConnectionPool = require('tedious-connection-pool')

// TODO add to config object
var poolConfig = {
  min: process.env.SQL_POOL_MIN_COUNT,
  max: process.env.SQL_POOL_MAX_COUNT,
  log: true
}

// full config details: https://github.com/tediousjs/tedious/blob/master/src/connection.js
var connectionConfig = {
  appName: process.env.SQL_APP_NAME,
  userName: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  options: {
    database: process.env.SQL_DATABASE,
    encrypt: true
  }
}

// TODO: declare methods inside?
// TODO: JsDoc - void return?
const sqlConnectionService = {}
let pool = null

// TODO: promisify?
sqlConnectionService.init = () => {
  pool = new ConnectionPool(poolConfig, connectionConfig)
  pool.on('error', function (err) {
    console.error(err)
  })
}

// TODO make async
sqlConnectionService.getConnection = () => {
  return new Promise((resolve, reject) => {
    if (pool == null) {
      sqlConnectionService.init()
    }
    pool.acquire(function (err, connection) {
      if (err) {
        reject(err)
      }
      resolve(connection)
    })
  })
}

module.exports = sqlConnectionService
