'use strict'

require('dotenv').config()
const config = require('../../config')
const winston = require('winston')
const Postgrator = require('postgrator')
const path = require('path')
const chalk = require('chalk')
const createDatabasesIfTheyDontExist = require('./createDatabase')
const yargs = require('yargs').argv

const mainDbMigrationConfig = {
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

const checksDbMigrationConfig = {
  migrationDirectory: path.join(__dirname, '/check-migrations'),
  driver: 'mssql',
  host: config.Sql.Server,
  port: config.Sql.Port,
  database: config.Sql.PupilChecksDb.Database,
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
  createDatabasesIfTheyDontExist()

  const postgrator = new Postgrator(mainDbMigrationConfig)
  // subscribe to useful events
  postgrator.on('migration-started', migration => winston.info(`executing ${migration.action}:${migration.name}...`))
  postgrator.on('error', error => winston.error(error.message))

  // Migrate to 'max' version or user-specified e.g. '008'
  const version = yargs.migrateMain || 'max'
  winston.info(chalk.green('Migrating Main DB to version:'), chalk.green.bold(version))

  try {
    await postgrator.migrate(version)
    winston.info(chalk.green('Main DB SQL Migrations complete'))
  } catch (error) {
    winston.error(chalk.red('ERROR:', error.message))
    winston.error(`${error.appliedMigrations.length} migrations were applied to Main DB...`)
    error.appliedMigrations.forEach(migration => {
      winston.error(migration.name)
    })
  }

  const checksMigrator = new Postgrator(checksDbMigrationConfig)
  // subscribe to useful events
  checksMigrator.on('migration-started', migration => winston.info(`executing ${migration.action}:${migration.name}...`))
  checksMigrator.on('error', error => winston.error(error.message))

  // Migrate to 'max' version or user-specified e.g. '008'
  const checksVersion =yargs.migrateChecks || 'max'
  winston.info(chalk.green('Migrating Checks DB to version:'), chalk.green.bold(checksVersion))

  try {
    await checksMigrator.migrate(checksVersion)
    winston.info(chalk.green('Checks DB SQL Migrations complete'))
  } catch (error) {
    winston.error(chalk.red('ERROR:', error.message))
    winston.error(`${error.appliedMigrations.length} migrations were applied to Checks DB...`)
    error.appliedMigrations.forEach(migration => {
      winston.error(migration.name)
    })
  }
}

winston.info('Preparing migrations...')

try {
  runMigrations()
    .then(() => {
      winston.info(chalk.green('all done'))
    },
    (error) => {
      winston.info(chalk.red(error.message))
      process.exitCode = 1
    })
} catch (error) {
  winston.error(`Error caught: ${error.message}`)
  process.exitCode = 1
}
