'use strict'

var ConnectionPool = require('tedious-connection-pool')
const sqlConfig = require('../../config/sql.config')
const logger = require('../log.service').getLogger()

var poolConfig = {
  min: sqlConfig.pool.min,
  max: sqlConfig.pool.min,
  log: sqlConfig.pool.loggingEnabled
}

// full config details: https://github.com/tediousjs/tedious/blob/master/src/connection.js
var connectionConfig = {
  appName: sqlConfig.application.name,
  userName: sqlConfig.application.username,
  password: sqlConfig.application.password,
  server: sqlConfig.server,
  options: {
    port: sqlConfig.port,
    database: sqlConfig.database,
    encrypt: true,
    requestTimeout: sqlConfig.requestTimeout
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
