#!/usr/bin/env node
'use strict'

require('dotenv').config()
const csv = require('fast-csv')
const fs = require('fs')
const sqlService = require('../services/data-access/sql.service')
const { TYPES } = sqlService

function readCSV (csvPath) {
  return new Promise((resolve, reject) => {
    if (csvPath === undefined) {
      reject(new Error('Please supply a valid CSV path'))
    } else if (!fs.existsSync(csvPath)) {
      reject(new Error('The supplied CSV path does not exist'))
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
          resolve(rows)
        })
        .on('error', reject)

      stream.pipe(csvStream)
    }
  })
}

function checkSchools (rows) {
  return new Promise((resolve, reject) => {
    const oldDfeNumbers = rows
      .map(({ OLD_dfeNumber: oldDFENumber }) => oldDFENumber)
      .filter(e => /^\d+$/.test(e))

    if (oldDfeNumbers.length === 0) {
      reject(new Error('No valid `OLD_dfeNumber` values supplied'))
    } else {
      sqlService
        .query(`
          SELECT COUNT(1) AS count FROM [mtc_admin].[school]
          WHERE dfeNumber IN (${oldDfeNumbers.join(',')})
        `)
        .then(result => {
          resolve(result[0].count)
        })
        .catch(reject)
    }
  })
}

function updateSchools (rows) {
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
      SET dfeNumber=@dfeNumber${i},
      estabCode=@estabCode${i},
      leaCode=@leaCode${i},
      name=@name${i}
      WHERE dfeNumber=@oldDFENumber${i}
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
  return sqlService.modifyWithTransaction(queries.join('\n'), params)
}

async function main () {
  const csvPath = process.argv[2]

  try {
    const rows = await readCSV(csvPath)
    await sqlService.initPool()
    const schoolChanges = await checkSchools(rows)
    if (schoolChanges === 0) {
      console.log('There are no schools matching the `OLD_dfeNumber` values in the supplied CSV')
      process.exit(1)
    }
    await updateSchools(rows)
    console.log(`Updated ${schoolChanges} schools`)
    process.exit(0)
  } catch (error) {
    throw error
  }
}

main()
  .then(() => {
    sqlService.drainPool()
  })
  .catch(e => {
    console.warn(e)
    sqlService.drainPool()
  })
