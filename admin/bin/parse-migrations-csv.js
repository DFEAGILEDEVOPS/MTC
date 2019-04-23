#!/usr/bin/env node
'use strict'

require('dotenv').config()
const csv = require('fast-csv')
const fs = require('fs')

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
        console.log(rows)
      })
      .on('error', error => {
        throw error
      })

    stream.pipe(csvStream)
  }
}

main()
