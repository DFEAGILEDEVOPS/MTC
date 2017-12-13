'use strict'

require('dotenv').config()
const config = require('../../config')
const Postgrator = require('postgrator')
const path = require('path')
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
console.log(migratorConfig)
const postgrator = new Postgrator(migratorConfig)

createDatabaseIfNotExists()
  .then(() => {
    // subscribe to useful events
    postgrator.on('migration-started', migration => console.log(`${migration.action}:${migration.name} started`))
    postgrator.on('migration-finished', migration => console.log(`${migration.action}:${migration.name} complete`))

    // Migrate to max version (optionally can provide 'max')
    postgrator.migrate()
      .then(appliedMigrations => {
        console.log('SQL Migrations complete')
        process.exit()
      })
      .catch(error => {
        console.log('ERROR:', error.message)
        console.log(`${error.appliedMigrations.length} migrations were applied...`)
        error.appliedMigrations.forEach(migration => {
          console.log(migration.name)
        })
        process.exit(1)
      })
  })
