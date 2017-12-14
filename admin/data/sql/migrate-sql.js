'use strict'

require('dotenv').config()
const Postgrator = require('postgrator')
const path = require('path')
const chalk = require('chalk')
const createDatabaseIfNotExists = require('./createDatabase')

const postgrator = new Postgrator({
  migrationDirectory: path.join(__dirname, '/migrations'),
  driver: 'mssql',
  host: process.env.SQL_SERVER,
  port: process.env.SQL_PORT || 1433,
  database: process.env.SQL_DATABASE,
  username: process.env.SQL_ADMIN_USER,
  password: process.env.SQL_ADMIN_USER_PASSWORD,
  // Schema table name. Optional. Default is schemaversion
  schemaTable: 'migrationLog',
  options: {
    encrypt: true
  },
  validateChecksums: false
})

createDatabaseIfNotExists()
  .then(() => {
    // subscribe to useful events
    postgrator.on('migration-started', migration => console.log(`${migration.action}:${migration.name} started`))
    postgrator.on('migration-finished', migration => console.log(`${migration.action}:${migration.name} complete`))

    // Migrate to 'max' version or user-specified e.g. '008'
    const version = process.argv.length > 2 ? process.argv[2] : 'max'
    console.log(chalk.green('Migrating to version:'), chalk.green.bold(version))
    postgrator.migrate(version)
      .then(appliedMigrations => {
        console.log(chalk.green('SQL Migrations complete'))
        process.exit()
      })
      .catch(error => {
        console.log(chalk.red('ERROR:', error.message))
        console.log(`${error.appliedMigrations.length} migrations were applied...`)
        error.appliedMigrations.forEach(migration => {
          console.log(migration.name)
        })
        process.exit(1)
      })
  })
