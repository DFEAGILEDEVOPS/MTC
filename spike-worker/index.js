'use strict'

const csv = require('fast-csv')
const fs = require('fs')
require('dotenv').config()
const bulkImport = require('./bulkImport')
const Stopwatch = require('timer-stopwatch')

// Instruments the import of the census CSV file....

// TODO find out how long it takes to load and import 5000 records from csv
// TODO find out how long it takes to load and import 600K records from csv

const pupilCensusCSV = 'pupilCensusData.csv'

async function loadAndImportCsv () {
  const stopwatch = new Stopwatch()
  console.log(`reading csv file`)
  stopwatch.start()
  // TODO load csv file from disk
  let csvData
  try {
    csvData = await readFromCSV()
  } catch (error) {
    console.log(error)
  }
  stopwatch.stop()
  console.log(`reading csv took ${stopwatch.ms / 1000} seconds`)
  // Remove headers row
  csvData.shift()
  stopwatch.reset()
  console.log(`invoking bulk import with csv payload`)
  stopwatch.start()
  await bulkImport(csvData)
  stopwatch.stop()
  console.log(`bulk import took ${stopwatch.ms / 1000} seconds`)
}

loadAndImportCsv()

/**
 * Read data from csv
 * @return {Promise<void>}
 */
async function readFromCSV () {
  let stream
  let pr
  pr = await new Promise((resolve, reject) => {
    const csvDataArray = []
    stream = fs.createReadStream(pupilCensusCSV)
    csv.fromStream(stream)
      .on('data', (data) => {
        csvDataArray.push(data)
      })
      .on('end', async () => {
        try {
          return resolve(csvDataArray)
        } catch (error) {
          reject(error)
        }
      })
  })
  return pr
}
