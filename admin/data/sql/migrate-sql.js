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
  // Schema table name. Optional. Default is schemaversion
  schemaTable: 'migrationLog',
  options: {
    encrypt: true
  },
  validateChecksums: false
}

const runMigrations = () => {
  return createDatabaseIfNotExists()
    .then(() => {
      const postgrator = new Postgrator(migratorConfig)
      // subscribe to useful events
      postgrator.on('migration-started', migration => winston.info(`executing ${migration.action}:${migration.name}...`))
      postgrator.on('error', error => winston.error(error.message))

      // Migrate to 'max' version or user-specified e.g. '008'
      const version = process.argv.length > 2 ? process.argv[2] : 'max'
      winston.info(chalk.green('Migrating to version:'), chalk.green.bold(version))
      postgrator.migrate(version)
        .then(appliedMigrations => {
          winston.info(chalk.green('SQL Migrations complete'))
          process.exit()
        })
        .catch(error => {
          winston.error(chalk.red('ERROR:', error.message))
          winston.error(`${error.appliedMigrations.length} migrations were applied...`)
          error.appliedMigrations.forEach(migration => {
            winston.error(migration.name)
          })
          process.exit(1)
        })
    })
}

if (config.Sql.Enabled === 'true') {
  const migrationWaitTime = config.Sql.Migrator.WaitTime
  winston.info('SQL Server enabled.  Preparing migrations...')
  if (migrationWaitTime > 0) {
    winston.info('Running migrations in %s seconds...', migrationWaitTime / 1000)
  }
  setTimeout(runMigrations, migrationWaitTime)
} else {
  winston.info('Sql Server Disabled. Bypassing Migrations...')
}
