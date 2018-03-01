#!/usr/bin/env node
'use strict'

const csv = require('fast-csv')
const fs = require('fs-extra')
const path = require('path')
const winston = require('winston')
const R = require('ramda')
const sqlService = require('../../admin/services/data-access/sql.service')

async function main () {
  winston.info('Create Jmeter reports directory if not present...')
  fs.ensureDir('../Jmeter/reports')
  winston.info('Fetching all existing pins...')
  try {
    let sql = `SELECT  s.[pin] AS schoolPin, p.[pin] AS pupilPin
    FROM ${sqlService.adminSchema}.[pupil] p
    LEFT JOIN ${sqlService.adminSchema}.[school] s
      ON p.school_id = s.id
    WHERE p.pin IS NOT NULL
    AND p.pinExpiresAt > GETUTCDATE()`

    const result = await sqlService.query(sql, [])
    let pins = result.map(r => R.values(r))

    if (pins.length === 0) {
      throw new Error('There are no active pins stored in the db!')
    }

    winston.info('Writing to CSV...')
    const csvHeaders = [ 'schoolPin', 'pupilPin' ]
    const csvStream = csv.format()
    const writableStream = fs.createWriteStream(path.join(__dirname, '../scenarios/data/pupilLogins.csv'))

    writableStream.on('finish', function () {
      console.log('DONE')
      process.exit(0)
    })

    csvStream.pipe(writableStream)
    csvStream.write(csvHeaders)
    pins.map(r => csvStream.write(r))
    csvStream.end()
  } catch (error) {
    winston.info(error)
    process.exit(1)
  }
}

main()
