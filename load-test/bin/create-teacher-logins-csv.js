#!/usr/bin/env node

'use strict'

/*
Creates a CSV of logins for teacher1.....teacher18000 for use in JMeter
*/

const csv = require('fast-csv')
const fs = require('fs-extra')
const path = require('path')
const winston = require('winston')

const teacherCount = 18000
const batchSize = 1000
const totalBatches = teacherCount / batchSize

async function main () {
  winston.info(`creating ${totalBatches} csv file `)
  let currentBatch = 0
  let teacherIndex = 1
  while (currentBatch < totalBatches) {
    currentBatch++
    winston.info(`creating batch ${currentBatch}`)
    const csvHeaders = ['username', 'password']
    const csvStream = csv.format()
    const writableStream = fs.createWriteStream(path.join(__dirname, `${currentBatch}-teacherLogins.csv`))
    csvStream.pipe(writableStream)
    csvStream.write(csvHeaders)
    let batchIndex = 0
    while (batchIndex < batchSize) {
      batchIndex++
      csvStream.write([`teacher${teacherIndex}`, 'password'])
      teacherIndex++
    }
    csvStream.end()
  }
}

async function old () {
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
