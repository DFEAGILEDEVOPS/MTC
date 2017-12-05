'use strict'

require('dotenv').config()
const Postgrator = require('postgrator')
const path = require('path')

const postgrator = new Postgrator({
  migrationDirectory: path.join(__dirname, '/migrations'),
  driver: 'mssql',
  host: process.env.SQL_SERVER,
  port: process.env.SQL_PORT || 1433,
  database: process.env.SQL_DATABASE,  // this wont exist??
  username: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  // Schema table name. Optional. Default is schemaversion
  schemaTable: 'migrationLog',
  options: {
    encrypt: true
  }
})

// subscribe to events
// postgrator.on('validation-started', migration => console.log('validating migration:', migration.name))
// postgrator.on('validation-finished', migration => console.log('validated migration:', migration.name))
postgrator.on('migration-started', migration => console.log(`starting migration:${migration.name} operation:${migration.action}`))
postgrator.on('migration-finished', migration => console.log(`starting migration:${migration.name} operation:${migration.action}`))

// Migrate to max version (optionally can provide 'max')
postgrator.migrate()
  .then(appliedMigrations => {
    console.log('SQL Migrations complete')
    process.exit()
  })
  .catch(error => {
    console.log(error)
    console.log(error.appliedMigrations)
  })
