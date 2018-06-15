#!/usr/bin/env node
'use strict'

const chalk = require('chalk')
const csv = require('fast-csv')
const fs = require('fs-extra')
const uuid = require('uuid/v4')
const config = require('../config')
const randomGenerator = require('../lib/random-generator')
const winston = require('winston')

let insertStatements = [], deleteStatements = []
const chars = 'abcdefghijklmnopqrstuwvxyz0123456789'

let urn = 1 // missing URN?, replace it with a non-conflicting increasing number for now..
let migrationNumber

if (process.argv.length > 2) {
    migrationNumber = process.argv[2]
} else {
    winston.error(chalk.red('Specify a migration number as the first argument'))
    process.exit(1)
}

fs.createReadStream('../NCATools_EduBase_20180604.txt')
    .pipe(csv({ delimiter: '|', headers: true, trim: true }))
    .on('data', (data) => {
        const estabCode = data["DfENumber"].substr(data["LEANUMBER"].length)
        const randPin = randomGenerator.getRandom(8, chars)
        const randUrlSlug = uuid().toUpperCase()

        const schoolName = data["NAME"].replace(/'/g, "''")
        const schoolNameEscaped = schoolName.replace(/`/, "\\`") // escape ` too for generating the up file

        if (data["LEANUMBER"] === '' || data["DfENumber"] === '') {
            // there are some schools with no LEANUMBER/DfENumber
            return
        }

        urn += 1

        insertStatements.push(`INSERT [mtc_admin].[school] (leaCode, estabCode, name, pin, pinExpiresAt, urlSlug, dfeNumber, urn)
        VALUES ('${data["LEANUMBER"]}', '${estabCode}', '${schoolNameEscaped}', '${randPin}', '2025-01-01 00:00:00.000', '${randUrlSlug}', '${data["DfENumber"]}', '${urn}');`)
        // delete by name AND the random generated url slug, to be sure we're deleting exactly what we added
        deleteStatements.push(`DELETE FROM [mtc_admin].[school] WHERE name = '${schoolName}' AND urlSlug='${randUrlSlug}';`)
    })
    .on('end', () => {
        fs.writeFileSync(`../data/sql/migrations/${migrationNumber}.do.add-school-dataset.js`, `'use strict'

const config = require('../../../config')

module.exports.generateSql = () => {

  if (config.MIGRATE_FULL_SCHOOL_DATASET === true) {
    return \`${insertStatements.join('\n')}\`
  } else {
    return ''
  }
}`)
        fs.writeFileSync(`../data/sql/migrations/${migrationNumber}.undo.add-school-dataset.sql`, deleteStatements.join('\n'))
    })
