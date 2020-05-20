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
  createPool: function createPool (poolName) {
    if (service.getPool(poolName)) {
      logger.warn(`cannot create connectionPool with name ${poolName}, as it already exists`)
    } else {
      const config = connectionBuilder.build(poolName)
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
   * @description get a pool by name
   * @param {string} poolName the name of the pool to fetch
   * @returns {object} the specified pool, if it exists
   */
  getPool: function getPool (poolName) {
    if ({}.hasOwnProperty.call(POOLS, poolName)) {
      return POOLS[poolName]
    }
  }
}

module.exports = service
