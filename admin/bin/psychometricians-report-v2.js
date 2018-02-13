#!/usr/bin/env node
'use strict'

require('dotenv').config()
const fs = require('fs')
const winston = require('winston')

const completedCheckDataService = require('../services/data-access/completed-check.data.service')
const completedCheckProcessingService = require('../services/completed-check-processing.service')
const psychometricianReportCacheDataService = require('../services/data-access/psychometrician-report-cache.data.service')
const psychometricianReportService = require('../services/psychometrician-report.service')

async function main () {
  try {
    if (process.argv.length > 2) {
      if (process.argv[2] === '-f') {
        // force the report to re-process all marks
        winston.info('force detected: re-processing all checks')
        await completedCheckDataService.sqlSetAllUnmarked()
        await psychometricianReportCacheDataService.sqlDeleteAll()
      }
    }

    winston.info('main: Processing the completed checks')
    // Make sure all completed checks are marked and ps-report data cached
    await completedCheckProcessingService.process()

    const report = await psychometricianReportService.generateReport()
    const filename = 'mtc-check.csv'
    fs.writeFileSync(filename, report)
    winston.info('Generated psychometric report: ' + filename)

    // Also generate a filtered version of the report, suitable for our customers
    //   const scoreReport = await psychometricianReportService.generateScoreReport()
    //   const filename2 = 'mtc-scores.csv'
    //   fs.writeFileSync(filename2, scoreReport)
    //   winston.info('Generated score report: ' + filename2)
  } catch (error) {
    winston.error(error)
  }
  process.exit(0)
}

main()
