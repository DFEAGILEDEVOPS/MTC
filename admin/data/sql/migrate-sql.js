'use strict'

require('dotenv').config()
const config = require('../../config')
const winston = require('winston')
const Postgrator = require('postgrator')
const path = require('path')
const chalk = require('chalk')
const {
  sortMigrationsAsc,
  sortMigrationsDesc
} = require('postgrator/lib/utils.js')
const createDatabaseIfNotExists = require('./createDatabase')

class Migrator extends Postgrator {
  /*
    The getRunnableMigrations method returns ALL pending
    migrations up to the specified migration
  */
  async getRunnableMigrations (databaseVersion, targetVersion) {
    const result = await this.runQuery(`SELECT version FROM ${this.config.schemaTable}`)
    const appliedMigrations = result.rows.map(r => parseInt(r.version))
    const { migrations } = this
    if (targetVersion >= databaseVersion) {
      return migrations
        .filter(
          migration =>
            migration.action === 'do' &&
            (migration.version > databaseVersion || !~appliedMigrations.indexOf(migration.version)) &&
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
}

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

const runMigrations = async (version) => {
  await createDatabaseIfNotExists()

  // @ts-ignore
  const postgrator = new Migrator(migratorConfig)

  // subscribe to useful events
  postgrator.on('migration-started', migration => winston.info(`executing ${migration.version} ${migration.action}:${migration.name}...`))
  postgrator.on('error', error => winston.error(error.message))

  // Migrate to 'max' version or user-specified e.g. '008'
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

try {
  runMigrations(process.argv[2] || 'max')
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
