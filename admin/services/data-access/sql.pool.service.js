'use strict'

var ConnectionPool = require('tedious-connection-pool')
const config = require('../../config')
const winston = require('winston')

var mainPoolConfig = {
  min: config.Sql.Pooling.MinCount,
  max: config.Sql.Pooling.MaxCount
}

// full config details: https://github.com/tediousjs/tedious/blob/master/src/connection.js
const mainConnectionConfig = {
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

const checksConnectionConfig = {
  appName: config.Sql.Application.Name,
  userName: config.Sql.PupilChecksDb.Application.Username,
  password: config.Sql.PupilChecksDb.Application.Password,
  server: config.Sql.Server,
  options: {
    port: config.Sql.Port,
    database: config.Sql.PupilChecksDb.Database,
    encrypt: true,
    requestTimeout: config.Sql.PupilChecksDb.Timeout
  }
}

let mainPool = null
let checksPool = null

const sqlPoolService = {}

/**
 * Initialise the connection pool.  Called once per application instance
 */
sqlPoolService.init = () => {
  if (mainPool == null) {
    mainPool = new ConnectionPool(mainPoolConfig, mainConnectionConfig)
    mainPool.on('error', function (err) {
      winston.error(err)
    })
  }
  if (checksPool == null) {
    checksPool = new ConnectionPool(checksPoolConfig, checksConnectionConfig)
    checksPool.on('error', function (err) {
      winston.error(err)
    })
  }
}

/**
 * Get a connection from the pool.
 * @return {Promise}
 */
sqlPoolService.getConnection = (connectionName = null) => {
  if (connectionName === 'checks') {
    return new Promise((resolve, reject) => {
      if (checksPool === null) {
        sqlPoolService.init()
      }
      checksPool.acquire(function (err, connection) {
        if (err) {
          reject(err)
          return
        }
        resolve(connection)
      })
    })
  }
  return new Promise((resolve, reject) => {
    if (mainPool === null) {
      sqlPoolService.init()
    }
    mainPool.acquire(function (err, connection) {
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
  if (mainPool) {
    mainPool.drain()
  }
  if (checksPool) {
    checksPool.drain()
  }
}

module.exports = sqlPoolService
