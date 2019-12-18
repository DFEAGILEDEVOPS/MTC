'use strict'

require('dotenv').config()
const config = require('../../config')
const logger = require('../../services/log.service').getLogger()
const Postgrator = require('postgrator')
const path = require('path')
const {
  sortMigrationsAsc,
  sortMigrationsDesc
} = require('postgrator/lib/utils.js')
const createDatabaseIfNotExists = require('./create-database')

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
  // Required for when SQL_PORT is passed in via docker-compose
  port: parseInt(config.Sql.Port),
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
  postgrator.on('migration-started', migration => logger.info(`executing ${migration.version} ${migration.action}:${migration.name}...`))

  // Migrate to 'max' version or user-specified e.g. '008'
  logger.info('Migrating to version: ' + version)

  try {
    await postgrator.migrate(version)
    logger.info('SQL Migrations complete')
  } catch (error) {
    logger.error('Error executing migration...')
    logger.error(error)
    logger.error(`${error.appliedMigrations.length} migrations were applied.`)
    error.appliedMigrations.forEach(migration => {
      logger.error(`- ${migration.name}`)
    })
    throw error
  }
}

runMigrations(process.argv[2] || 'max')
  .then(() => {
    logger.info('Done')
    process.exit(0)
  })
  .catch(() => {
    logger.alert('Migrations Failed')
    process.exit(1)
  })
