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
  userName: process.env.SQL_APP_USER,
  password: process.env.SQL_APP_USER_PASSWORD,
  server: process.env.SQL_SERVER,
  port: process.env.SQL_PORT || 1433,
  options: {
    database: process.env.SQL_DATABASE,
    encrypt: true,
    requestTimeout: process.env.SQL_TIMEOUT
  }
}

let pool = null

const sqlPoolService = {}

  /**
   * Initialise the connection pool.  Called once per application instance
   * @return {Promise}
   */
sqlPoolService.init = () => {
  if (pool !== null) return
  pool = new ConnectionPool(poolConfig, connectionConfig)
  pool.on('error', function (err) {
    console.error(err)
  })
}

  /**
   * Get a connection from the pool.
   * @return {Promise}
   */
sqlPoolService.getConnection = () => {
  return new Promise((resolve, reject) => {
    if (pool === null) {
      sqlPoolService.init()
    }
    pool.acquire(function (err, connection) {
      if (err) {
        reject(err)
      }
      resolve(connection)
    })
  })
}

module.exports = sqlPoolService
