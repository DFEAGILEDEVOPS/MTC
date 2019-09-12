#!/usr/bin/env node
'use strict'

const csv = require('fast-csv')
const fs = require('fs')
const faker = require('faker')
const R = require('ramda')
const moment = require('moment')
const momentRandom = require('moment-random')

const sqlService = require('./services/data-access/sql.service')
const upnService = require('./services/upn.service')
const outputFilename = 'pupilCensusData.csv'

const currentUTCDate = moment.utc()
const currentYear = currentUTCDate.year()
const academicYear = currentUTCDate.isBetween(moment.utc(`${currentYear}-01-01`), moment.utc(`${currentYear}-08-31`), null, '[]')
  ? currentYear - 1 : currentYear

let pupilCount = 0

function writeCsv (data) {
  if (!data.length) {
    return
  }
  const headers = ['LEA', 'Estab', 'UPN', 'Surname', 'Forename', 'Middlenames', 'Gender', 'DOB']
  const ws = fs.createWriteStream(outputFilename, { flags: 'a' })
  csv
    .write(data, { headers: headers })
    .pipe(ws)
}

async function getSchoolDfeNumbers () {
  const sql = `SELECT dfeNumber
  FROM ${sqlService.adminSchema}.school`
  const result = await sqlService.query(sql, [])
  return R.map(r => R.prop('dfeNumber', r), result)
}

function generateUpn (dfeNumber) {
  const leaCode = dfeNumber.slice(0, 3)
  const estabCode = dfeNumber.slice(3, dfeNumber.length)
  const minYearValue = academicYear - 11
  const maxYearValue = academicYear - 7
  const year = Math.floor(Math.random() * (maxYearValue - minYearValue + 1) + minYearValue).toString().substr(-2)
  let baseUpn = leaCode + estabCode + year
  pupilCount += 1
  if (pupilCount > 999) {
    pupilCount = 1
    baseUpn = (parseInt(baseUpn) + 1000).toString()
  }
  const serial = pupilCount.toString().padStart(3, '0')
  return upnService.calculateCheckLetter(baseUpn + serial) + baseUpn + serial
}

async function main () {
  await sqlService.initPool()
  console.log('Generating census records...')
  const csvData = []
  let dfeNumbers
  try {
    dfeNumbers = await getSchoolDfeNumbers()
  } catch (error) {
    console.log(error)
    await sqlService.drainPool()
    process.exit(1)
  }
  for (let i = 0; i < dfeNumbers.length; i++) {
    for (let j = 0; j <= 31; j++) {
      const dfeNumber = dfeNumbers[i].toString()
      const upn = generateUpn(dfeNumber, pupilCount)
      const record = [
        dfeNumber.slice(0, 3), // LEA
        dfeNumber.slice(3, dfeNumber.length), // Estab
        upn,
        faker.name.lastName(), // Surname
        faker.name.firstName(), // Forename
        i % 100 === 0 ? faker.name.firstName() : '', // Middlenames
        i % 10 === 0 ? 'M' : 'F', // Gender
        momentRandom(
          moment.utc(`${academicYear - 7}-09-01`),
          moment.utc(`${academicYear - 11}-09-02`)
        ).format('DD/MM/YYYY') // DOB
      ]
      csvData.push(record)
    }
  }
  writeCsv(csvData)
  console.log('Census CSV generated')
  await sqlService.drainPool()
}

main()
