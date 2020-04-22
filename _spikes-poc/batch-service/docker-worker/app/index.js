'use strict'

const mssql = require('mssql')
const poolConfig = require('./config/sql.config')

let pool
const name = 'docker-worker'

async function initPool () {
  if (pool) {
    console.warn('The connection pool has already been initialised')
    return
  }
  pool = new mssql.ConnectionPool(poolConfig)
  pool.on('error', err => {
    console.log('SQL Pool Error:', err)
  })
  return pool.connect()
}

async function drainPool () {
  if (!pool) {
    console.warn('The connection pool is not initialised')
    return
  }
  return pool.close()
}

;(async function main () {
  try {
    console.log(`${name} starting`)
    await initPool()
    console.log(`${name} db pool init complete`)
    const req = pool.request()
    const res = await req.query(`SELECT * FROM [mtc_admin].[settings]`)
    console.log(`${name} query complete: `, res)
    await drainPool()
    console.log(`${name} db pool drained`)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})()
