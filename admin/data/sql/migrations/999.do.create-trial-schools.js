'use strict'

const csv = require('fast-csv')
const fs = require('fs')
const path = require('path')
const winston = require('winston')

const genSql = () => {
  const csvPath = path.join(__dirname, '../../files/feb-trial-schools.csv')
  const csvStream = fs.createReadStream(csvPath)
  const schoolInserts = []
  csv.fromStream(csvStream, { headers: true })
   .on('data', (data) => {
     const schoolInsert = createRowInsert(data)
     schoolInserts.push(schoolInsert)
   })
   .on('end', () => {
     return schoolInserts.join('\n')
   })
   .on('error', (error) => {
     winston.error(`unable to parse ${csvPath} due to error...\n${error}`)
   })
}

function createRowInsert (data) {
  return `INSERT INTO [mtc_admin].[school] ([name], [urn], [dfeNumber] VALUES ('${makeStringSqlSafe(data.name)}', ${data.dfeNumber}, ${data.dfeNumber})`
}

function makeStringSqlSafe (str) {
  return str.replace('\'', '')
}

module.exports.generateSql = genSql
