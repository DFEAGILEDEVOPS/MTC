'use strict'

require('dotenv').config()
const Postgrator = require('postgrator')
const path = require('path')
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
  }
})

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
