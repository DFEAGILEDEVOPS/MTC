'use strict'

const { ConnectionPool } = require('mssql')
const logger = require('../log.service').getLogger()
const POOLS = {}

const service = {
  /**
   * @description create a new connection pool
   * @param {object} config the connection attributes
   * @param {string} name the unique name of the pool
   * @returns {ConnectionPool} the active connection pool
   */
  createPool: function createPool (config, name) {
    if (service.getPool(name)) {
      logger.warn(`cannot create connectionPool with name ${name}, as it already exists`)
    } else {
      POOLS[name] = new ConnectionPool(config)
    }
    return POOLS[name]
  },
  /**
   * @description closes the specified pool
   * @param {string} name the name of the pool to close
   * @returns {Promise.<object>} a promise containing the closing pool
   */
  closePool: function closePool (name) {
    if ({}.hasOwnProperty.call(POOLS, name)) {
      const pool = POOLS[name]
      delete POOLS[name]
      return pool.close()
    }
  },
  /**
   * @description get a pool by name
   * @param {string} name the name of the pool to fetch
   * @returns {object} the specified pool, if it exists
   */
  getPool: function getPool (name) {
    if ({}.hasOwnProperty.call(POOLS, name)) {
      return POOLS[name]
    }
  }
}

module.exports = service
