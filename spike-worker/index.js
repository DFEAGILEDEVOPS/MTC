'use strict'

// Instruments the import of the census CSV file....

// TODO find out how long it takes to load and import 5000 records from csv
// TODO find out how long it takes to load and import 600K records from csv

require('dotenv').config()
const bulkImport = require('./bulkImport')
const Stopwatch = require('node-stopwatch').Stopwatch

function loadAndImportCsv () {
  const stopwatch = Stopwatch.create()
  console.log(`reading csv file`)
  stopwatch.start()
  // TODO load csv file from disk
  let csvData = []
  stopwatch.stop()
  console.log(`reading csv took ${stopwatch.elapsed.seconds} seconds`)
  stopwatch.reset()
  console.log(`invoking bulk import with csv payload`)
  stopwatch.start()
  bulkImport(csvData)
  stopwatch.stop()
  console.log(`bulk import took ${stopwatch.elapsed.seconds} seconds`)
}

loadAndImportCsv()
