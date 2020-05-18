'use strict'

const { ConnectionPool } = require('mssql')
const POOLS = {}

const service = {
  /**
   * @description create a new connection pool
   * @param {object} config the connection attributes
   * @param {string} name the unique name of the pool
   * @returns {Promise.<object>} the active connection pool
   */
  createPool: async function createPool (config, name) {
    if (service.getPool(name)) {
      throw new Error('Pool with this name already exists')
    }
    POOLS[name] = await (new ConnectionPool(config)).connect()
    return POOLS[name]
  },
  /**
   * @description closes the specified pool
   * @param {string} name the name of the pool to close
   * @returns {Promise.<object>} a promise containing the closing pool
   */
  closePool: function closePool (name) {
    if (Object.prototype.hasOwnProperty.apply(POOLS, name)) {
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
    if (Object.prototype.hasOwnProperty.apply(POOLS, name)) {
      return POOLS[name]
    }
  }
}

module.exports = service
