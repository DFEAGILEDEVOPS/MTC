#!/usr/bin/env node
'use strict'

const csv = require('fast-csv')
const fs = require('fs')
const faker = require('faker')
const moment = require('moment')
const commandLineArgs = require('command-line-args')
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

function main (options) {
  const { recordsLength } = options
  const csvData = []
  const baseUpn = '801500001'
  for (let i = 0; i < recordsLength; i++) {
    const pupilIdx = i + 1
    const serial = pupilIdx.toString().padStart(3, '0')
    const record = [
      '999', // LEA
      '1000', // Estab
      upnService.calculateCheckLetter(baseUpn + serial) + baseUpn + serial,
      faker.name.lastName(), // Surname
      faker.name.firstName(), // Forename
      i % 100 === 0 ? faker.name.firstName() : '', // Middlenames
      i % 10 === 0 ? 'M' : 'F', // Gender
      moment(faker.date.between('2005', '2006')).format('MM/DD/YY') // DOB
    ]
    csvData.push(record)
  }
  writeCsv(csvData)
}

main(options)
