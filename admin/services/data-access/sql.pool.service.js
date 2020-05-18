'use strict'

const { ConnectionPool } = require('mssql')
const POOLS = {}

async function createPool (config, name) {
  if (getPool(name)) {
    throw new Error('Pool with this name already exists')
  }
  POOLS[name] = await (new ConnectionPool(config)).connect()
  return POOLS[name]
}

function closePool (name) {
  if (Object.prototype.hasOwnProperty.apply(POOLS, name)) {
    const pool = POOLS[name]
    delete POOLS[name]
    return pool.close()
  }
}

function getPool (name) {
  if (Object.prototype.hasOwnProperty.apply(POOLS, name)) {
    return POOLS[name]
  }
}

module.exports = {
  closePool,
  createPool,
  getPool
}
