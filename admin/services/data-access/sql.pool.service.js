'use strict'

const { ConnectionPool } = require('mssql')
const connectionBuilder = require('./sql.role-connection.builder')
const logger = require('../log.service').getLogger()
const POOLS = {}

const service = {
  /**
   * @description create a new connection pool
   * @param {string} poolName the unique name of the pool
   * @returns {ConnectionPool} the active connection pool
   */
  createPool: function createPool (poolName, readonly = false) {
    if (service.getPool(poolName)) {
      logger.warn(`cannot create connectionPool with name ${poolName}, as it already exists`)
    } else {
      const config = connectionBuilder.build(poolName, readonly)
      POOLS[poolName] = new ConnectionPool(config)
    }
    return POOLS[poolName]
  },
  /**
   * @description closes the specified pool
   * @param {string} poolName the name of the pool to close
   * @returns {Promise.<object>} a promise containing the closing pool
   */
  closePool: function closePool (poolName) {
    if ({}.hasOwnProperty.call(POOLS, poolName)) {
      const pool = POOLS[poolName]
      delete POOLS[poolName]
      return pool.close()
    }
  },
  /**
   * @description get a pool by name. will auto create if specified.
   * @param {string} poolName the name of the pool to fetch
   * @param {Boolean} createIfNotFound if the pool does not exist, it will be created
   * @returns {ConnectionPool} the specified pool, if it exists
   */
  getPool: function getPool (poolName, createIfNotFound = false) {
    if ({}.hasOwnProperty.call(POOLS, poolName)) {
      return POOLS[poolName]
    } else {
      if (createIfNotFound === true) {
        const pool = service.createPool(poolName)
        return pool
      }
    }
  }
}

module.exports = service
