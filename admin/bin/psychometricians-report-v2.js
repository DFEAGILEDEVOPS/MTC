#!/usr/bin/env node
'use strict'

require('dotenv').config()
const mongoose = require('mongoose')
// mongoose.set('debug', true)
const autoIncrement = require('mongoose-auto-increment')
const fs = require('fs')

const psychometricianReportService = require('../services/psychometrician-report.service')
const completedCheckProcessingService = require('../services/completed-check-processing.service')

mongoose.connect(process.env.MONGO_CONNECTION_STRING, async function (error) {
  if (error) { return console.error(error) }
  try {
    autoIncrement.initialize(mongoose.connection)

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
    console.log('Generated report: ' + filename)
  } catch (error) {
    console.error(error)
  }
  mongoose.connection.close()
})
