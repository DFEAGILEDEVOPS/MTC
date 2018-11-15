'use strict'

require('dotenv').config()
const config = require('../../config')
const fs = require('fs')
const winston = require('winston')
const path = require('path')
const chalk = require('chalk')
const R = require('ramda')

const poolService = require('../../services/data-access/sql.pool.service')
const sqlService = require('../../services/data-access/sql.service')

const seedsDirectory = path.join(__dirname, '/seeds')
const seedFilenameFormat = ['version', 'table', 'name', 'format'];

const loadSeeds = () => (new Promise((resolve, reject) => {
  fs.readdir(seedsDirectory, (err, files) => {
    if (err) {
      return reject(err)
    }
    resolve(files)
  })
}))

const processSeed = async (seed) => {
  const { name, format } = seed

  if (format === 'tsv') {
    // handle TSV
  } else if (format === 'sql') {
    // handle SQL
  } else if (format === 'js') {
    // handle JS
  } else {
    throw new Error(`Unsupported format: ${format} for seed ${name}`)
  }
}

const runSeeds = async (version) => {
  winston.info(chalk.green('Migrating seeds: '), chalk.green.bold(version))

  try {
    const seedList = await loadSeeds()
    const seeds = seedList
      // split the filename to get each part in the format
      .map(seed => seed.split("."))
      // filter out the ones that don't respect the format
      .filter(seed => seed.length === seedFilenameFormat.length)
      // create an object with { formatProperty: seedProperty } from the format
      .map(seed => R.mergeAll(seedFilenameFormat.map((name, idx) => ({ [name]: seed[idx] })) ))

    if (seeds.length !== seedList.length) {
      throw new Error('The seeds directory contains migrations that don\'t respect the format')
    }

    await Promise.all(seeds.map(processSeed))

    winston.info(chalk.green('SQL Seeds complete'))
  } catch (error) {
    winston.error(chalk.red('ERROR: ', error.message))
  }
}

const main = async () => {
  try {
    runSeeds(process.argv[2] || 'all')
      .then(() => {
        winston.info(chalk.green('Done'))
        process.exit(0)
      },
      (error) => {
        winston.info(chalk.red(error.message))
        process.exit(1)
      })
  } catch (error) {
    winston.error(`Error caught: ${error.message}`)
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
