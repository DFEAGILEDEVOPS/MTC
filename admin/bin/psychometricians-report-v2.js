#!/usr/bin/env node
'use strict'

require('dotenv').config()
const mongoose = require('mongoose')
// mongoose.set('debug', true)
const autoIncrement = require('mongoose-auto-increment')
const fs = require('fs')

const psychometricianReportService = require('../services/psychometrician-report.service')
const completedCheckProcessingService = require('../services/completed-check-processing.service')
const completedCheckDataService = require('../services/data-access/completed-check.data.service')

mongoose.connect(process.env.MONGO_CONNECTION_STRING, async function (error) {
  if (error) { return console.error(error) }
  try {
    autoIncrement.initialize(mongoose.connection)

    if (process.argv.length > 2) {
      if (process.argv[2] === '-f') {
        // force the report to re-process all marks
        console.log('force detected: re-processing all checks')
        await completedCheckDataService.update({}, {$set: {isMarked: false}}, {multi: true})
      }
    }

    // Load some dependencies, so mongoose doesn't error out
    require('../models/pupil')
    require('../models/check-window')
    require('../models/check-form')
    require('../models/school')

    console.log('Processing the completed checks')
    // Make sure all completed checks are marked and ps-report data cached
    await completedCheckProcessingService.process()

    const report = await psychometricianReportService.generateReport()
    const db = mongoose.connection
    const filename = 'mtc-check-' + db.name + '.csv'
    fs.writeFileSync(filename, report)
    console.log('Generated psych report: ' + filename)

    // Also generate a filtered version of the report, suitable for our customers
    const scoreReport = await psychometricianReportService.generateScoreReport()
    const filename2 = 'mtc-scores-' + db.name + '.csv'
    fs.writeFileSync(filename2, scoreReport)
    console.log('Generated score report: ' + filename2)
  } catch (error) {
    console.error(error)
  }
  mongoose.connection.close()
})
