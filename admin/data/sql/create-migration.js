#!/usr/bin/env node
'use strict'

const moment = require('moment')
const fs = require('fs')
const path = require('path')
const commandLineArgs = require('command-line-args')

const migrationsDir = path.join(__dirname, 'migrations')

const optionDefinitions = [
  { name: 'name', alias: 'n', type: String, defaultOption: true },
  { name: 'type', alias: 't', type: String },
  { name: 'help', alias: 'h', type: Boolean }
]

const jsMigrationTemplate = `
'use strict'
module.exports.generateSql = function () {
}
`

const createMigration = options => {
  const version = moment().format('YYYYMMDDHHmmss')
  const upFile = path.join(migrationsDir, `${version}.do.${options.name.toLowerCase()}`)
  const downFile = path.join(migrationsDir, `${version}.undo.${options.name.toLowerCase()}`)
  let upFileName, downFileName
  if (options.type && options.type.toLowerCase() === 'js') {
    upFileName = `${upFile}.js`
    downFileName = `${downFile}.js`
    fs.writeFileSync(upFileName, jsMigrationTemplate)
    fs.writeFileSync(downFileName, jsMigrationTemplate)
  } else {
    upFileName = `${upFile}.sql`
    downFileName = `${downFile}.sql`
    fs.writeFileSync(upFileName, '')
    fs.writeFileSync(downFileName, '')
  }
  console.log(`Created ${upFileName} and ${downFileName}`)
}

try {
  const options = commandLineArgs(optionDefinitions)
  if (options.help || !options.name) {
    console.log(`
    Usage: create-migration.js <name> [--type <sql|js>]
    `)
    process.exit(0)
  }
  createMigration(options)
  process.exit(0)
} catch (error) {
  console.log(`Error: ${error.message}`)
  process.exit(1)
}
