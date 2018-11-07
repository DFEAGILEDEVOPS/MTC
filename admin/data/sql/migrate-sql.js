'use strict'

require('dotenv').config()
const config = require('../../config')
const winston = require('winston')
const Postgrator = require('postgrator')
const path = require('path')
const chalk = require('chalk')
const commandLineArgs = require('command-line-args')
const {
  sortMigrationsAsc,
  sortMigrationsDesc
} = require('postgrator/lib/utils.js')
const createDatabaseIfNotExists = require('./createDatabase')

const optionDefinitions = [
  { name: 'version', alias: 'v', type: String },
  { name: 'help', alias: 'h', type: Boolean }
]

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

const runMigrations = async (options) => {
  await createDatabaseIfNotExists()

  const postgrator = new Postgrator(migratorConfig)

  let result = await postgrator.runQuery(`SELECT version FROM ${postgrator.config.schemaTable}`)
  let appliedMigrations = result.rows.map(result => parseInt(result.version))

  // Patch the getRunnableMigrations method
  postgrator.getRunnableMigrations = (databaseVersion, targetVersion) => {
    const { migrations } = postgrator
    if (targetVersion >= databaseVersion) {
      return migrations
        .filter(
          migration =>
            migration.action === 'do' &&
            (migration.version > databaseVersion || appliedMigrations.indexOf(migration.version) === -1) &&
            migration.version <= targetVersion
        )
        .sort(sortMigrationsAsc)
    }
    if (targetVersion < databaseVersion) {
      return migrations
        .filter(
          migration =>
            migration.action === 'undo' &&
            migration.version <= databaseVersion &&
            migration.version > targetVersion
        )
        .sort(sortMigrationsDesc)
    }
    return []
  }

  // subscribe to useful events
  postgrator.on('migration-started', migration => winston.info(`executing ${migration.action}:${migration.name}...`))
  postgrator.on('error', error => winston.error(error.message))

  // Migrate to 'max' version or user-specified e.g. '008'
  const version = options.version || 'max'
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
    throw new Error(error)
  }
}

try {
  const options = commandLineArgs(optionDefinitions)
  if (options.help || (options['apply-missing'] && options['version'])) {
    console.log(`
    Usage: <script> --apply-missing | --version <migration number>
    `)
    process.exit(0)
  }
  runMigrations(options)
    .then(() => {
      winston.info(chalk.green('Done'))
    },
    (error) => {
      winston.info(chalk.red(error.message))
      process.exit(1)
    })
} catch (error) {
  winston.error(`Error caught: ${error.message}`)
  process.exit(1)
}
