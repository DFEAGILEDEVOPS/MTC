#!/usr/bin/env node

'use strict'

const csv = require('fast-csv')
const fs = require('fs-extra')
const path = require('path')
const winston = require('winston')

/*
Creates a CSV of logins for teacher1.....teacher18000 for use in JMeter
*/

async function main () {
  winston.info('Writing to CSV...')
  const csvHeaders = ['username', 'password']
  const csvStream = csv.format()
  const writableStream = fs.createWriteStream(path.join(__dirname, 'teacherLogins.csv'))
  csvStream.pipe(writableStream)
  csvStream.write(csvHeaders)
  writableStream.on('finish', function () {
    console.log('DONE')
  })

  try {
    const teacherCount = 18000
    let current = 0
    while (current < teacherCount) {
      current++
      csvStream.write([`teacher${current}`, 'password'])
    }
    csvStream.end()
  } catch (error) {
    winston.info(error)
    process.exitCode = 1
  }
}

main()
