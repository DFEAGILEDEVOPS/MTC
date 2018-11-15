'use strict'

require('dotenv').config()
const config = require('../../config')
const winston = require('winston')
const path = require('path')
const chalk = require('chalk')

const runSeeds = async (version) => {
  winston.info(chalk.green('Running seeds: '), chalk.green.bold(version))

  try {
    winston.info(chalk.green('SQL Seeds complete'))
  } catch (error) {
    winston.error(chalk.red('ERROR:', error.message))
  }
}

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
