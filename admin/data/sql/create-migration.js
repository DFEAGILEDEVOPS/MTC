#!/usr/bin/env node
'use strict'

const moment = require('moment')
const fs = require('fs')
const path = require('path')

const migrationsDir = path.join(__dirname, 'migrations')

const createMigration = name => {
  const version = moment().format('YYYYMMDDHHmmss')
  const upFilename = `${version}.do.${name.toLowerCase()}.sql`
  const downFilename = `${version}.undo.${name.toLowerCase()}.sql`
  fs.closeSync(fs.openSync(path.join(migrationsDir, upFilename), 'w'))
  fs.closeSync(fs.openSync(path.join(migrationsDir, downFilename), 'w'))
  console.log(`Created ${upFilename} and ${downFilename}`)
}

try {
  if (process.argv.length < 3) {
    console.log(`
    Usage: node create-migration.js <migration-name>
    `)
    process.exit(0)
  }
  createMigration(process.argv[2])
} catch (error) {
  console.log(`Error: ${error.message}`)
  process.exit(1)
}
