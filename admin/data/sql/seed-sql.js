'use strict'

require('dotenv').config()
const R = require('ramda')
const csv = require('fast-csv')
const fs = require('fs')
const path = require('path')
const logger = require('../../services/log.service').getLogger()

const sqlService = require('../../services/data-access/sql.service')

const seedsDirectory = path.join(__dirname, '/seeds')
const seedFilenameFormat = ['version', 'table', 'name', 'format']
const supportedFileFormats = ['tsv', 'sql', 'js']

const loadSeeds = () => (new Promise((resolve, reject) => {
  fs.readdir(seedsDirectory, (err, files) => {
    if (err) {
      return reject(err)
    }
    resolve(files)
  })
}))

const processSeed = async (seed) => {
  const { format, filename } = seed
  const filepath = path.join(seedsDirectory, filename)

  if (!supportedFileFormats.includes(format)) {
    throw new Error(`Unsupported format: ${format} for seed ${filename}`)
  }

  let content; let sql; let params = []
  if (format === 'tsv') {
    // handle TSV
    content = []
    await new Promise((resolve, reject) => {
      csv.fromPath(filepath, { delimiter: '\t', headers: true, trim: true })
        .on('data', (data) => {
          content.push(data)
        })
        .on('error', reject)
        .on('end', resolve)
    })
    if (content.length === 0) {
      logger.info(`Empty seed: ${filename}`)
      return
    }
    const { table } = seed
    const generatedSql = await sqlService.generateMultipleInsertStatements(table, content)
    sql = generatedSql.sql
    params = generatedSql.params
  } else if (format === 'sql') {
    // handle SQL
    content = fs.readFileSync(filepath, 'utf8')
    sql = content
  } else if (format === 'js') {
    // handle JS
    content = require(filepath)
    sql = await content.generateSql()
  }

  logger.info(filename)
  try {
    await sqlService.modify(sql, params)
  } catch (error) {
    /*
      We can ignore certain error codes and
      assume the migration is being re run
    */
    const ignoreErrorCodes = [
      2601, // Cannot insert duplicate key
      2627 // Violation of UNIQUE KEY constraint
    ]
    if (!~ignoreErrorCodes.indexOf(error.number)) {
      throw error
    }
  }
}

const runSeeds = async (version) => {
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
        await processSeed(seeds[i])
      }
    } else {
      const foundSeed = seeds.find((seed) => seed.version === version)
      if (!foundSeed) throw new Error(`Seed not found: ${version}`)

      await processSeed(foundSeed)
    }
    logger.info('SQL Seeds complete')
  } catch (error) {
    logger.error('ERROR: ', error)
    throw error
  }
}

(async function main () {
  try {
    await sqlService.initPool()
    await runSeeds(process.argv[2] || 'all')
  } catch (error) {
    process.exitCode = 1
    logger.error(`Error caught: ${error.message}`)
  } finally {
    const drainInfo = await sqlService.drainPool()
    logger.info('seeds complete: ', drainInfo)
  }
})()
