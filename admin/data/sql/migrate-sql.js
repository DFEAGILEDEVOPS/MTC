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
      postgrator.on('migration-started', migration => winston.info(`${migration.action}:${migration.name} started`))
      postgrator.on('migration-finished', migration => winston.info(`${migration.action}:${migration.name} complete`))

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

winston.info('sql enabled:', config.Sql.Enabled)

if (config.Sql.Enabled === 'true') {
  const tenSeconds = 10000
  winston.info(`waiting ${tenSeconds}ms for SQL Server to come online before running migrations...`)
  setTimeout(runMigrations, 15000)
} else {
  winston.info('Sql Server Disabled. Bypassing Migrations...')
}
