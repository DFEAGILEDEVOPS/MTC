'use strict'

const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '..', '.env')
const mssql = require('mssql')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}

const config = require('../config')
const sqlConfig = require('../sql.config')
const logger = require('./log.service').getLogger()
const Postgrator = require('postgrator')
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

const sqlConfig = {
  
}

const migratorConfig = {
  migrationPattern: path.join(__dirname, '..', 'migrations', '**'),
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
    encrypt: sqlConfig.options.encrypt,
    enableArithAbort: sqlConfig.options.enableArithAbort,
    trustServerCertificate: sqlConfig.options.trustServerCertificate
  },
  validateChecksums: false
}

const runMigrations = async (version) => {
  try {
    await createDatabaseIfNotExists()
    const postgrator = new Migrator(migratorConfig)
    // subscribe to useful events
    postgrator.on('migration-started', migration => logger.info(`executing ${migration.version} ${migration.action}:${migration.name}...`))
    // Migrate to 'max' version or user-specified e.g. '008'
    logger.info('Migrating to version: ' + version)
    await postgrator.migrate(version)
    logger.info('SQL Migrations complete')
  } catch (error) {
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
