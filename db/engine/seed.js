'use strict'

const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '..', '.env')
const mssql = require('mssql')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}
const R = require('ramda')
const sqlConfig = require('../sql.config')
const logger = require('./log.service').getLogger()

const seedsDirectory = path.join(__dirname, '..', 'seeds')
const seedFilenameFormat = ['version', 'table', 'name', 'format']

const loadSeeds = () => (new Promise((resolve, reject) => {
  fs.readdir(seedsDirectory, (err, files) => {
    if (err) {
      return reject(err)
    }
    resolve(files)
  })
}))

/**
 *
 * @param {string} seed
 * @param {import('mssql').ConnectionPool} pool
 */
const processSeed = async (seed, pool) => {
  const { format, filename } = seed
  const filepath = path.join(seedsDirectory, filename)

  let content; let sql

  switch(format) {
    case 'sql':
      content = fs.readFileSync(filepath, 'utf8')
      sql = content
      break
    case 'js':
      content = require(filepath)
      sql = await content.generateSql()
      break
    default:
      throw new Error(`unsupported format:${format} for seed ${filename}`)
  }
  logger.info(filename)
  try {
    const request = new mssql.Request(pool)
    await request.query(sql)
  } catch (error) {
    /*
      We can ignore certain error codes and
      assume the seed is being re run
    */
    const ignoreErrorCodes = [
      2601, // Cannot insert duplicate key
      2627, // Violation of UNIQUE KEY constraint
      547 // The INSERT statement conflicted with the FOREIGN KEY constraint
    ]
    if (ignoreErrorCodes.indexOf(error.number) >= 0) {
      logger.warn(`ignoring error: ${error.message}`)
      logger.warn('This seed is likely to have been previously applied to this database.')
    } else {
      throw error
    }
  }
}

/**
 *
 * @param {number} version
 * @param {import('mssql').ConnectionPool} pool
 */
const runSeeds = async (version, pool) => {
  if (pool === undefined || pool.connected === false) {
    throw new Error('an open mssql.ConnectionPool is required')
  }
  logger.info(`Migrating seeds: ${version}`)

  try {
    const seedList = await loadSeeds()
    const seeds = seedList
      // split the filename to get each part in the format
      .map(seed => seed.split('.'))
      // filter out the ones that don't respect the format
      .filter(seed => seed.length === seedFilenameFormat.length)
      // create an object with { formatProperty: seedProperty } from the format
      .map(seed => R.mergeAll(
        R.append(
          { filename: seed.join('.') },
          seedFilenameFormat.map((name, idx) => ({ [name]: seed[idx] }))
        )
      ))

    if (seeds.length !== seedList.length) {
      throw new Error('The seeds directory contains migrations that don\'t respect the format')
    }

    if (version === 'all') {
      for (let i = 0; i < seeds.length; i++) {
        await processSeed(seeds[i], pool)
      }
    } else {
      const foundSeed = seeds.find((seed) => seed.version === version)
      if (!foundSeed) throw new Error(`Seed not found: ${version}`)
      await processSeed(foundSeed, pool)
    }
    logger.info('SQL Seeds complete')
  } catch (error) {
    logger.error('ERROR: ', error)
    throw error
  }
}

(async function main () {
  let pool
  try {
    pool = new mssql.ConnectionPool(sqlConfig)
    await pool.connect()
    await runSeeds(process.argv[2] || 'all', pool)
  } catch (error) {
    process.exitCode = 1
    logger.error(`Error caught: ${error.message}`)
  } finally {
    await pool.close()
    logger.info('sql connection pool closed')
  }
})()
