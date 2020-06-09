'use strict'

const { ConnectionPool } = require('mssql')
const connectionBuilder = require('./sql.role-connection.builder')
const logger = require('../log.service').getLogger()
const POOLS = {}

const buildPoolName = (poolName, readonly) => {
  return `${poolName}:read=${readonly}`
}

const service = {
  /**
   * @description create a new connection pool
   * @param {string} poolName the unique name of the pool
   * @returns {ConnectionPool} the active connection pool
   */
  createPool: function createPool (poolName, readonly = false) {
    const internalPoolName = buildPoolName(poolName, readonly)
    if (service.getPool(poolName, false, readonly)) {
      logger.warn(`cannot create connectionPool with name ${internalPoolName}, as it already exists`)
    } else {
      const config = connectionBuilder.build(poolName, readonly)
      POOLS[internalPoolName] = new ConnectionPool(config)
    }
    return POOLS[internalPoolName]
  },
  /**
   * @description closes the specified pool
   * @param {string} poolName the name of the pool to close
   * @returns {Promise.<object>} a promise containing the closing pool
   */
  closePool: function closePool (poolName, readonly = false) {
    const pool = service.getPool(poolName, false, readonly)
    if (pool) {
      const internalPoolName = buildPoolName(poolName, readonly)
      delete POOLS[internalPoolName]
      return pool.close()
    }
  },
  /**
   * @description get a pool by name. will auto create if specified.
   * @param {string} poolName the name of the pool to fetch
   * @param {Boolean} createIfNotFound if the pool does not exist, it will be created
   * @returns {ConnectionPool} the specified pool, if it exists
   */
  getPool: function getPool (poolName, createIfNotFound = false, readonly = false) {
    const internalPoolName = buildPoolName(poolName, readonly)
    if ({}.hasOwnProperty.call(POOLS, internalPoolName)) {
      return POOLS[internalPoolName]
    } else {
      if (createIfNotFound === true) {
        const pool = service.createPool(poolName, readonly)
        return pool
      }
    }
  }
}

module.exports = service
