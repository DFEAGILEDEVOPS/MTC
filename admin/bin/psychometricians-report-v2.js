#!/usr/bin/env node
'use strict'

const mongoose = require('mongoose')
// mongoose.set('debug', true)
const autoIncrement = require('mongoose-auto-increment')

// const psychometricianReportService = require('../services/psychometrician-report.service')
const completedCheckProcessingService = require('../services/completed-check-processing.service')

mongoose.connect(process.env.MONGO_CONNECTION_STRING, async function (error) {
  if (error) { return console.error(error) }
  try {
    autoIncrement.initialize(mongoose.connection)

    // Load some dependencies, so mongoose doesn't error out
    require('../models/pupil')
    require('../models/check-window')
    require('../models/check-form')

    console.log('Processing the completed checks')
    // Make sure all completed checks are marked and ps-report data cached
    await completedCheckProcessingService.process()

    // const data = await psychometricianReportService.generateReport()
  } catch (error) {
    console.error(error)
  }
  mongoose.connection.close()
})
