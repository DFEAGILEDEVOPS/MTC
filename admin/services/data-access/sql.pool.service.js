'use strict'

const { ConnectionPool } = require('mssql')
const connectionBuilder = require('./sql.role-connection.builder')
const logger = require('../log.service').getLogger()
const POOLS = {}

const buildInternalPoolName = (roleName, readonly) => {
  return `${roleName}:read=${readonly}`
}

const service = {
  /**
   * @description create a new connection pool
   * @param {import('../../lib/consts/roles')} roleName the user role the pool will serve
   * @returns {import('mssql').ConnectionPool} the active connection pool
   */
  createPool: function createPool (roleName, readonly = false) {
    const existingPool = service.getPool(roleName, false, readonly)
    if (existingPool !== undefined) {
      logger.warn(`cannot create connectionPool for role:${roleName} readonly:${readonly}, as it already exists`)
      return existingPool
    } else {
      const config = connectionBuilder.build(roleName, readonly)
      const internalPoolName = buildInternalPoolName(roleName, readonly)
      POOLS[internalPoolName] = new ConnectionPool(config)
      return POOLS[internalPoolName]
    }
  },
  /**
   * @description closes the specified pool
   * @param {import('../../lib/consts/roles')} roleName the user role the pool will serve
   * @returns {Promise.<object>} a promise containing the closing pool
   */
  closePool: function closePool (roleName, readonly = false) {
    const pool = service.getPool(roleName, false, readonly)
    if (pool) {
      const internalPoolName = buildInternalPoolName(roleName, readonly)
      delete POOLS[internalPoolName]
      return pool.close()
    }
  },
  /**
   * @description get a pool by name. will auto create if specified.
   * @param {import('../../lib/consts/roles')} roleName the user role the pool will serve
   * @param {Boolean} createIfNotFound if the pool does not exist, it will be created
   * @returns {import('mssql').ConnectionPool} the specified pool, if it exists
   */
  getPool: function getPool (roleName, createIfNotFound = false, readonly = false) {
    const internalPoolName = buildInternalPoolName(roleName, readonly)
    if ({}.hasOwnProperty.call(POOLS, internalPoolName)) {
      return POOLS[internalPoolName]
    } else {
      if (createIfNotFound === true) {
        const pool = service.createPool(roleName, readonly)
        return pool
      }
    }
  }
}

module.exports = service
