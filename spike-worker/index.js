'use strict'

const csv = require('fast-csv')
const fs = require('fs')
require('dotenv').config()
const bulkImport = require('./bulkImport')
const Stopwatch = require('timer-stopwatch')
const commandLineArgs = require('command-line-args')

const schoolLookup = require('./schoolLookup')

const optionDefinitions = [
  { name: 'schoolLookupDisabled', alias: 'l', type: Boolean }
]

const options = commandLineArgs(optionDefinitions)

const pupilCensusCSV = 'pupilCensusData.csv'

async function loadAndImportCsv (options) {
  const { schoolLookupDisabled } = options
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
  let schoolData
  // Perform school lookup outside of the stopwatch timer scope
  if (schoolLookupDisabled) {
    schoolData = await schoolLookup(csvData)
  }
  stopwatch.reset()
  console.log(`invoking bulk import with csv payload`)
  stopwatch.start()
  await bulkImport(csvData, schoolLookupDisabled, schoolData)
  stopwatch.stop()
  console.log(`bulk import took ${stopwatch.ms / 1000} seconds`)
}

(async () => {
  try {
    await loadAndImportCsv(options)
  } catch (e) {
    console.log(e)
  }
})()

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
