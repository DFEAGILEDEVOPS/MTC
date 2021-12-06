'use strict'

const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '..', '.env')

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
const mssql = require('mssql')
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
    const result = await this.config.execQuery(`SELECT version FROM ${this.config.schemaTable}`)
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

const runMigrations = async (version) => {
  try {
    await createDatabaseIfNotExists()

    sqlConfig.user = config.Sql.Migrator.Username
    sqlConfig.password = config.Sql.Migrator.Password
    const client = new mssql.ConnectionPool(sqlConfig)
    await client.connect()

    const migratorConfig = {
      migrationPattern: path.join(__dirname, '..', 'migrations', '**'),
      driver: 'mssql',
      // Required for when SQL_PORT is passed in via docker-compose
      database: config.Sql.Database,
      // Schema table name. Optional. Default is schemaversion
      schemaTable: 'migrationLog',
      validateChecksums: false,
      execQuery: (query) => {
        return new Promise((resolve, reject) => {
          const request = new mssql.Request(client)
          // batch will handle multiple queries
          request.batch(query, (err, result) => {
            if (err) {
              return reject(err)
            }
            return resolve({
              rows: result && result.recordset ? result.recordset : result,
            })
          })
        })
      }
    }
    const postgrator = new Migrator(migratorConfig)
    // subscribe to useful events
    postgrator.on('migration-started', migration => logger.info(`executing ${migration.version} ${migration.action}:${migration.name}...`))
    // Migrate to 'max' version or user-specified e.g. '008'
    logger.info('Migrating to version: ' + version)
    await postgrator.migrate(version)
    await client.close()
    logger.info('SQL Migrations complete')
  } catch (error) {
    logger.error(error)
    console.dir(error)
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
