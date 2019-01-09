'use strict'

var ConnectionPool = require('tedious-connection-pool')
const config = require('../../config')
const logger = require('../log.service').getLogger()

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
    requestTimeout: config.Sql.Timeout
  }
}

let pool = null

const sqlPoolService = {}

/**
 * Initialise the connection pool.  Called once per application instance
 */
sqlPoolService.init = () => {
  logger.info('sqlPoolService.init() called')
  if (pool !== null) return
  logger.info('sqlPoolService.init() initialising a new connection pool')
  pool = new ConnectionPool(poolConfig, connectionConfig)
  pool.on('error', function (error) {
    logger.error('sqlPoolService.init() Error initialising new connection', error)
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
  if (pool) {
    pool.drain()
  }
}

module.exports = sqlPoolService
