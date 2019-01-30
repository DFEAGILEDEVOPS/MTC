'use strict'

require('dotenv').config()
const R = require('ramda')
const chalk = require('chalk')
const csv = require('fast-csv')
const fs = require('fs')
const path = require('path')
const logger = require('../../services/log.service').getLogger()

const poolService = require('../../services/data-access/sql.pool.service')
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
      assume the seed is being re run
    */
    const ignoreErrorCodes = [
      2601, // Cannot insert duplicate key
      2627, // Violation of UNIQUE KEY constraint
      547 // The INSERT statement conflicted with the FOREIGN KEY constraint
    ]
    if (!~ignoreErrorCodes.indexOf(error.number)) {
      throw error
    } else {
      logger.warn(`ignoring error: ${error.message}`)
      logger.warn('This seed is likely to have been previously applied to this database.')
    }
  }
}

const runSeeds = async (version) => {
  logger.info(chalk.green('Migrating seeds: '), chalk.green.bold(version))

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

    logger.info(chalk.green('SQL Seeds complete'))
  } catch (error) {
    logger.error(chalk.red('ERROR: ', error.message))
    logger.error(chalk.red('ERROR: ', error.stack))
  }
}

const main = async () => {
  try {
    runSeeds(process.argv[2] || 'all')
      .then(() => {
        logger.info(chalk.green('Done'))
        process.exit(0)
      },
      (error) => {
        logger.info(chalk.red(error.message))
        process.exit(1)
      })
  } catch (error) {
    logger.error(`Error caught: ${error.message}`)
    process.exit(1)
  }
}

main()
  .then(() => {
    poolService.drain()
  })
  .catch(e => {
    console.warn(e)
    poolService.drain()
  })
