
require('dotenv').config()
const config = require('../config')
import * as winston from 'winston'
import * as Postgrator from 'postgrator'
import * as path from 'path'
import * as chalk from 'chalk'
import * as databaseCreator from './databaseCreator'

class Migrator {

  private migratorConfig: Postgrator.MsSQLOptions = {
    migrationDirectory: path.join(__dirname, '../../sql/migrations'),
    driver: 'mssql',
    host: config.Sql.Server,
    port: config.Sql.Port,
    database: config.Sql.Database,
    username: config.Sql.Migrator.Username,
    password: config.Sql.Migrator.Password,
    requestTimeout: config.Sql.Migrator.Timeout,
    connectionTimeout: config.Sql.Migrator.Timeout,
    schemaTable: 'migrationLog',
    options: {
      encrypt: true
    },
    validateChecksums: false
  }

  run (): void {
    try {
      this.runMigrations()
        .then(() => {
          winston.info(chalk.green('all done'))
        },
          (error) => {
            winston.info(chalk.red(error))
            process.exitCode = 1
          })
    } catch (error) {
      winston.error(`Error caught: ${error.message}`)
      process.exitCode = 1
    }
  }

  private async runMigrations () {
    await databaseCreator.default.create()

    const postgrator = new Postgrator(this.migratorConfig)
    // subscribe to useful events
    postgrator.on('migration-started', migration => winston.info(`executing ${migration.action}:${migration.name}...`))
    postgrator.on('migration-finished', () => winston.info(chalk.green('SQL Migrations complete')))

    // Migrate to 'max' version or user-specified e.g. '008'
    const version = process.argv.length > 2 ? process.argv[2] : 'max'
    winston.info(chalk.green('Migrating to version:'), chalk.green.bold(version))

    try {
      await postgrator.migrate(version)
    } catch (error) {
      winston.error(chalk.red('ERROR:', error.message))
      winston.error(`${error.appliedMigrations.length} migrations were applied...`)
      error.appliedMigrations.forEach(migration => {
        winston.error(migration.name)
      })
    }
  }
}

export = new Migrator().run()
