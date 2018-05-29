#!/usr/bin/env node
'use strict'

const csv = require('fast-csv')
const fs = require('fs')
const R = require('ramda')
const faker = require('faker')
const moment = require('moment')
const commandLineArgs = require('command-line-args')
const winston = require('winston')

const sqlService = require('../admin/services/data-access/sql.service')
const upnService = require('../admin/services/upn.service')
const outputFilename = 'pupilCensusData.csv'

const optionDefinitions = [
  { name: 'recordsLength', alias: 'r', type: Number }
]

const options = commandLineArgs(optionDefinitions)

function writeCsv (data) {
  if (!data.length) {
    return
  }
  const headers = ['LEA', 'Estab', 'UPN', 'Surname', 'Forename', 'Middlenames', 'Gender', 'DOB']
  const ws = fs.createWriteStream(outputFilename, { flags: 'a' })
  csv
    .write(data, {headers: headers})
    .pipe(ws)
}

async function getSchoolsLength () {
  const sql = `SELECT COUNT(*) AS [cnt]
  FROM ${sqlService.adminSchema}.school`
  const result = await sqlService.query(sql, [])
  const obj = R.head(result)
  return R.prop('cnt', obj)
}

async function main (options) {
  winston.info('Generating census records...')
  const { recordsLength } = options
  const csvData = []
  let baseUpn = '702500001'
  let schoolsLength
  try {
    schoolsLength = await getSchoolsLength()
    schoolsLength = schoolsLength - 1
  } catch (error) {
    winston.info(error)
  }
  for (let i = 0; i <= recordsLength; i++) {
    let pupilIdx = i + 1
    if (pupilIdx > 999) {
      baseUpn = (parseInt(baseUpn) + 1000).toString()
      pupilIdx = 1
    }
    const serial = pupilIdx.toString().padStart(3, '0')
    const upn = upnService.calculateCheckLetter(baseUpn + serial) + baseUpn + serial
    const randomEstabCode = (Math.floor(Math.random() * schoolsLength) + 1001).toString()
    const record = [
      '999', // LEA
      randomEstabCode, // Estab
      upn,
      faker.name.lastName(), // Surname
      faker.name.firstName(), // Forename
      i % 100 === 0 ? faker.name.firstName() : '', // Middlenames
      i % 10 === 0 ? 'M' : 'F', // Gender
      moment(faker.date.between('2005', '2006')).format('MM/DD/YY') // DOB
    ]
    csvData.push(record)
  }
  writeCsv(csvData)
  winston.info('Census CSV generated')
}

main(options)
