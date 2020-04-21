#!/usr/bin/env node

'use strict'
const csvString = require('csv-string')
const fs = require('fs')
const csvFile = process.argv[2]

if (!csvFile) {
  console.error('Missing CSV File')
  process.exit(1)
}

function generateSql (targetDfeNumber, pupilUpn) {
  return `UPDATE [mtc_admin].[pupil]
          SET school_id = (SELECT id from [mtc_admin].[school] where dfeNumber = ${targetDfeNumber})
          WHERE upn = '${pupilUpn}';`
}

async function main () {
  const fileData = fs.readFileSync(csvFile).toString()
  const arr = csvString.parse(fileData)
  const sql = []

  arr.forEach((row) => {
    if (row[0].match(/Date/)) {
      return
    }
    const targetDfeNumber = row[4]
    const pupilUpn = row[7] && row[7].replace(/[^a-zA-Z0-9]/g, '')
    if (!targetDfeNumber || !pupilUpn) {
      return
    }
    const s = generateSql(targetDfeNumber, pupilUpn)
    sql.push(s)
  })
  console.log(sql.join('\n'))
}

;(async function () {
  try {
    await main()
  } catch (error) {
    console.error(error)
  }
})()
