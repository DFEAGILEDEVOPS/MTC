#!/usr/bin/env node
'use strict'

require('dotenv').config()
const mongoose = require('mongoose')
// mongoose.set('debug', true)
const autoIncrement = require('mongoose-auto-increment')
const fs = require('fs')
const winston = require('winston')

const psychometricianReportService = require('../services/psychometrician-report.service')
const completedCheckProcessingService = require('../services/completed-check-processing.service')
const completedCheckDataService = require('../services/data-access/completed-check.data.service')

mongoose.connect(process.env.MONGO_CONNECTION_STRING, async function (error) {
  if (error) { return winston.error(error) }
  try {
    autoIncrement.initialize(mongoose.connection)

    if (process.argv.length > 2) {
      if (process.argv[2] === '-f') {
        // force the report to re-process all marks
        winston.info('force detected: re-processing all checks')
        await completedCheckDataService.sqlSetAllUnmarked()
      }
    }

    // Load some dependencies, so mongoose doesn't error out
    require('../models/pupil')
    require('../models/check-window')
    require('../models/check-form')
    require('../models/school')

    winston.info('Processing the completed checks')
    // Make sure all completed checks are marked and ps-report data cached
    await completedCheckProcessingService.process()

    const report = await psychometricianReportService.generateReport()
    const db = mongoose.connection
    const filename = 'mtc-check-' + db.name + '.csv'
    fs.writeFileSync(filename, report)
    winston.info('Generated psych report: ' + filename)

    // Also generate a filtered version of the report, suitable for our customers
    const scoreReport = await psychometricianReportService.generateScoreReport()
    const filename2 = 'mtc-scores-' + db.name + '.csv'
    fs.writeFileSync(filename2, scoreReport)
    winston.info('Generated score report: ' + filename2)
  } catch (error) {
    winston.error(error)
  }
  mongoose.connection.close()
})
