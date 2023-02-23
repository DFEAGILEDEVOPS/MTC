'use strict'

const path = require('path')
const fs = require('fs')
const mssql = require('mssql')
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

async function main () {
  const config = require('../config')
  const sqlConfig = require('../sql.config')
  const logger = require('./log.service').getLogger()
  const createDatabaseIfNotExists = require('./createDatabase')
  const Postgrator = await import('postgrator') // dynamic import ES Module
  const { sortMigrationsAsc, sortMigrationsDesc } = await import('postgrator/lib/utils.js') // dynamic import

  /**
   *
   * @param {string} database
   * @param {mssql.ConnectionPool} client
   */
  function getMigratorConfig (database, client) {
    const asyncExecQuery = async function (query) {
      const request = new mssql.Request(client)
      const goStatementRegex = new RegExp(/^\s*GO\s*$/im)

      if (query.match(goStatementRegex) !== null) {
        const batches = query.split(goStatementRegex)
        for (const batch of batches) {
          await request.batch(batch)
        }
      } else {
        const result = await request.batch(query)
        return {
          rows: result && result.recordset ? result.recordset : result
        }
      }
    }

    return {
      migrationPattern: path.join(__dirname, '..', 'migrations', '**'),
      driver: 'mssql',
      database,
      validateChecksums: false,
      schemaTable: 'migrationLog',
      execQuery: asyncExecQuery
    }
  }


  class Migrator extends Postgrator.default {
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


  const runMigrations = async (version) => {
    try {
      await createDatabaseIfNotExists()
      const client = new mssql.ConnectionPool({
        server: config.Sql.Server,
        database: config.Sql.Database,
        user: config.Sql.Migrator.Username,
        password: config.Sql.Migrator.Password,
        options: sqlConfig.options,
        requestTimeout: config.Sql.Migrator.Timeout,
        connectionTimeout: config.Sql.Migrator.Timeout,
        pool:  {
          max: 1,
          min: 1
        }
      })
      await client.connect()
      const postgrator = new Migrator(getMigratorConfig(config.Sql.Database, client))
      // subscribe to useful events
      postgrator.on('migration-started', migration => logger.info(`executing ${migration.version} ${migration.action}:${migration.name}...`))
      // Migrate to 'max' version or user-specified e.g. '008'
      logger.info('Migrating to version: ' + version)
      // const migrations = await postgrator.getRunnableMigrations(0, 'max')
      await postgrator.migrate(version)
      logger.info('SQL Migrations complete')
      // close the db connection
      await client.close()
    } catch (error) {
      logger.error(error)
      logger.error(`${error.appliedMigrations.length} migrations were applied.`)
      error.appliedMigrations.forEach(migration => {
        logger.error(`- ${migration.name}`)
      })
      // close the db connection
      await client.close()
      throw error
    }
  }

  // Run the migrations
  try {
    await runMigrations(process.argv[2] || 'max')
    logger.info('Done')
    process.exit(0)
  } catch (error) {
    logger.alert('Migrations Failed')
    process.exit(1)
  }
}

main()
