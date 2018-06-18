#!/usr/bin/env node
'use strict'

const chalk = require('chalk')
const csv = require('fast-csv')
const fs = require('fs-extra')
const uuid = require('uuid/v4')
const winston = require('winston')

let insertStatements = []
let deleteStatements = []

let migrationNumber

if (process.argv.length > 2) {
  migrationNumber = process.argv[2]
} else {
  winston.error(chalk.red('Specify a migration number as the first argument, i.e `node generate-migration-from-schooldata.js 100` to generate migration number 100'))
  process.exit(1)
}

fs.createReadStream('../NCATools_EduBase_20180604.txt')
  .pipe(csv({ delimiter: '|', headers: true, trim: true }))
  .on('data', (data) => {
    const estabCode = data['DfENumber'].substr(data['LEANUMBER'].length)
    const randUrlSlug = uuid().toUpperCase()

    const schoolName = data['NAME'].replace(/'/g, "''")
    const schoolNameEscaped = schoolName.replace(/`/, '\\`') // escape ` too for generating the up file

    if (data['LEANUMBER'] === '' || data['DfENumber'] === '') {
      // there are some schools with no LEANUMBER/DfENumber
      return
    }

    if (data['ISKEYSTAGE2'] !== '1') {
      // only import records where ISKEYSTAGE2=1
      return
    }

    const urn = data['DfENumber']

    insertStatements.push(`INSERT [mtc_admin].[school] (leaCode, estabCode, name, urlSlug, dfeNumber, urn)
      VALUES ('${data['LEANUMBER']}', '${estabCode}', '${schoolNameEscaped}', '${randUrlSlug}', '${data['DfENumber']}', '${urn}');`)
    // delete by the unique random generated url slug, to be sure we're deleting exactly what we added
    deleteStatements.push(`DELETE FROM [mtc_admin].[school] WHERE urlSlug='${randUrlSlug}';`)
  })
  .on('end', () => {
    fs.writeFileSync(`../data/sql/migrations/${migrationNumber}.do.add-school-dataset.js`, `'use strict'

const config = require('../../../config')

module.exports.generateSql = () => {
  if (config.MIGRATE_FULL_SCHOOL_DATASET !== true) {
    return ''
  }

  return \`${insertStatements.join('\n')}\`
}
`)
    fs.writeFileSync(`../data/sql/migrations/${migrationNumber}.undo.add-school-dataset.sql`, deleteStatements.join('\n'))
    winston.info(chalk.green(`Generated migration ${migrationNumber}.do.add-school-dataset.js and ${migrationNumber}.undo.add-school-dataset.sql`))
  })
