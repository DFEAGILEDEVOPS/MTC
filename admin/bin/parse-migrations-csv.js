#!/usr/bin/env node
'use strict'

require('dotenv').config()
const csv = require('fast-csv')
const fs = require('fs')
const sqlService = require('../services/data-access/sql.service')
const { TYPES } = sqlService

function functionUpdateSchools (rows) {
  const queries = []
  const params = []
  rows.forEach((row, i) => {
    const {
      dfeNumber,
      estabCode,
      leaCode,
      OLD_dfeNumber: oldDFENumber,
      name
    } = row
    queries.push(`
      UPDATE [mtc_admin].[school]
      SET dfeNumber=dfeNumber${i},
      estabCode=estabCode${i},
      leaCode=leaCode${i},
      name=name${i}
      WHERE dfeNumber=oldDFENumber${i}
    `)
    params.push({
      name: `dfeNumber${i}`,
      value: dfeNumber,
      type: TYPES.Int
    })
    params.push({
      name: `estabCode${i}`,
      value: estabCode,
      type: TYPES.Int
    })
    params.push({
      name: `leaCode${i}`,
      value: leaCode,
      type: TYPES.Int
    })
    params.push({
      name: `name${i}`,
      value: name,
      type: TYPES.NVarChar
    })
    params.push({
      name: `oldDFENumber${i}`,
      value: oldDFENumber,
      type: TYPES.Int
    })
  })
  console.log(queries)
  console.log(params)
  // sqlService.modifyWithTransaction(queries.join('\n'), params)
}

function main () {
  const csvPath = process.argv[2]

  if (csvPath === undefined) {
    throw new Error('Please supply a valid CSV path')
  } else if (!fs.existsSync(csvPath)) {
    throw new Error('The supplied CSV path does not exist')
  } else {
    const stream = fs.createReadStream(csvPath)

    let columns = false
    const rows = []

    const csvStream = csv()
      .on('data', data => {
        if (!columns) {
          columns = data
        } else {
          const row = {}
          data.forEach((e, i) => {
            row[columns[i]] = e
          })
          rows.push(row)
        }
      })
      .on('end', () => {
        functionUpdateSchools(rows)
      })
      .on('error', error => {
        throw error
      })

    stream.pipe(csvStream)
  }
}

main()
