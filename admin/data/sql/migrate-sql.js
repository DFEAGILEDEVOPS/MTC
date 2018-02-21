'use strict'

require('dotenv').config()
const config = require('../../config')
const winston = require('winston')
const Postgrator = require('postgrator')
const path = require('path')
const chalk = require('chalk')
const createDatabaseIfNotExists = require('./createDatabase')

const migratorConfig = {
  migrationDirectory: path.join(__dirname, '/migrations'),
  driver: 'mssql',
  host: config.Sql.Server,
  port: config.Sql.Port,
  database: config.Sql.Database,
  username: config.Sql.Migrator.Username,
  password: config.Sql.Migrator.Password,
  requestTimeout: config.Sql.Migrator.Timeout,
  connectionTimeout: config.Sql.Migrator.Timeout,
  // Schema table name. Optional. Default is schemaversion
  schemaTable: 'migrationLog',
  options: {
    encrypt: true
  },
  validateChecksums: false
}

const runMigrations = async () => {
  await createDatabaseIfNotExists()

  const postgrator = new Postgrator(migratorConfig)
  // subscribe to useful events
  postgrator.on('migration-started', migration => winston.info(`executing ${migration.action}:${migration.name}...`))
  postgrator.on('error', error => winston.error(error.message))

  // Migrate to 'max' version or user-specified e.g. '008'
  const version = process.argv.length > 2 ? process.argv[2] : 'max'
  winston.info(chalk.green('Migrating to version:'), chalk.green.bold(version))

  try {
    await postgrator.migrate(version)
    winston.info(chalk.green('SQL Migrations complete'))
  } catch (error) {
    winston.error(chalk.red('ERROR:', error.message))
    winston.error(`${error.appliedMigrations.length} migrations were applied...`)
    error.appliedMigrations.forEach(migration => {
      winston.error(migration.name)
    })
  }
}

winston.info('Preparing migrations...')

// const migrationWaitTime = config.Sql.Migrator.WaitTime
// if (migrationWaitTime > 0) {
//   winston.info('Running migrations in %s seconds...', migrationWaitTime / 1000)
// }
// setTimeout(runMigrations, migrationWaitTime)

try {
  runMigrations()
    .then(() => {
      winston.info(chalk.green('all done'))
    },
    (error) => {
      winston.info(chalk.red(error.message))
    })
} catch (error) {
  winston.error(`Error caught: ${error.message}`)
}
