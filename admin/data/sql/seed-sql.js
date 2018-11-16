'use strict'

require('dotenv').config()
const R = require('ramda')
const chalk = require('chalk')
const config = require('../../config')
const csv = require('fast-csv')
const fs = require('fs')
const path = require('path')
const winston = require('winston')

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
  const { name, format, filename } = seed

  if (!supportedFileFormats.includes(format)) {
    throw new Error(`Unsupported format: ${format} for seed ${filename}`)
  }

  let content, sql, params = []
  if (format === 'tsv') {
    // handle TSV
    content = []
    await new Promise((resolve, reject) => {
      csv.fromPath(path.join(seedsDirectory, filename), { delimiter: '\t', headers: true, trim: true })
        .on('data', (data) => {
          content.push(data)
        })
        .on('error', reject)
        .on('end', resolve)
    })
    if (content.length === 0) {
      winston.info(`Empty seed: ${filename}`)
      return
    }
    const { table } = seed
    const generatedSql = await sqlService.generateMultipleInsertStatements(table, content)
    sql = generatedSql.sql
    params = generatedSql.params
  } else if (format === 'sql') {
    // handle SQL
    content = fs.readFileSync(filename, 'utf8')
    sql = [content]
  } else if (format === 'js') {
    // handle JS
    content = require(filename)
    sql = content.generateSql()
  }

  await sqlService.modify(sql, params)
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
      await Promise.all(seeds.map(processSeed))
    } else {
        const foundSeed = seeds.find(({ filename }) => filename === version)
        if (!foundSeed) throw new Error(`Seed not found: ${version}`)

        await processSeed(foundSeed)
    }

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
