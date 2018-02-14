'use strict'

var ConnectionPool = require('tedious-connection-pool')
const config = require('../../config')
const winston = require('winston')
// TODO add to config object
var poolConfig = {
  min: config.Sql.Pooling.MinCount,
  max: config.Sql.Pooling.MaxCount,
  log: config.Sql.Pooling.LoggingEnabled
}

// full config details: https://github.com/tediousjs/tedious/blob/master/src/connection.js
var connectionConfig = {
  appName: config.Sql.Application.Name,
  userName: config.Sql.Application.Username,
  password: config.Sql.Application.Password,
  server: config.Sql.Server,
  options: {
    port: config.Sql.Port,
    database: config.Sql.Database,
    encrypt: true,
    requestTimeout: config.Sql.Timeout,
    useUTC: false
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
    winston.error(err)
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
        return
      }
      resolve(connection)
    })
  })
}

/**
 * Disconnect all pool connections
 */
sqlPoolService.drain = () => {
  return pool.drain()
}

module.exports = sqlPoolService
