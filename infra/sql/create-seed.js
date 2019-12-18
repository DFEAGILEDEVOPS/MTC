#!/usr/bin/env node
'use strict'

const moment = require('moment')
const fs = require('fs')
const path = require('path')
const commandLineArgs = require('command-line-args')
const logger = require('../../services/log.service').getLogger()

const seedsDir = path.join(__dirname, 'seeds')

const optionDefinitions = [
  { name: 'name', alias: 'n', type: String, defaultOption: true },
  { name: 'format', alias: 'f', type: String, defaultValue: 'tsv' },
  { name: 'table', alias: 't', type: String, defaultValue: 'custom' },
  { name: 'help', alias: 'h', type: Boolean }
]

const jsMigrationTemplate = `
'use strict'
module.exports.generateSql = function () {
}
`

const createSeeder = options => {
  const version = moment().format('YYYYMMDDHHmmss')
  const seedFile = path.join(seedsDir, `${version}.${options.table.toLowerCase()}.${options.name.toLowerCase()}`)
  let seedFileName
  if (options.format && options.format.toLowerCase() === 'js') {
    seedFileName = `${seedFile}.js`
    fs.writeFileSync(seedFileName, jsMigrationTemplate)
  } else {
    seedFileName = `${seedFile}.${options.format.toLowerCase()}`
    fs.writeFileSync(seedFileName, '')
  }
  logger.info(`Created ${seedFileName}`)
}

try {
  const options = commandLineArgs(optionDefinitions)
  if (options.help || !options.name || (options.format === 'tsv' && options.table === 'custom')) {
    logger.info(`
    Usage: create-seed.js <name> [--table <model|custom>] [--format <tsv|sql|js>] [--help]
    `)
    process.exit(0)
  }
  createSeeder(options)
  process.exit(0)
} catch (error) {
  logger.error(`Error: ${error.message}`)
  process.exit(1)
}
