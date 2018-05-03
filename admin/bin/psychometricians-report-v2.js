#!/usr/bin/env node
'use strict'

require('dotenv').config()
const fs = require('fs')
const winston = require('winston')

const poolService = require('../services/data-access/sql.pool.service')
const commandLineArgs = require('command-line-args')
const markingService = require('../services/marking.service')
const checkProcessingService = require('../services/check-processing.service')
const psychometricianReportCacheDataService = require('../services/data-access/psychometrician-report-cache.data.service')
const psychometricianReportService = require('../services/psychometrician-report.service')
let requiresMarking = false
let requiresProcessing = false

const optionDefinitions = [
  { name: 'forceReprocess', alias: 'f', type: Boolean },
  { name: 'marking', alias: 'm', type: Boolean },
  { name: 'process', alias: 'p', type: Boolean }
]

const options = commandLineArgs(optionDefinitions)

async function main (options) {
  try {
    if (options.forceReprocess) {
      // force the report to re-calculate the cached ps-report
      winston.info('force detected: re-processing all checks')
      await psychometricianReportCacheDataService.sqlDeleteAll()
    }
    if (options.marking) {
      requiresMarking = true
    }
    if (options.process) {
      requiresProcessing = true
    }

    winston.info('main: Processing the completed checks')
    // Make sure all completed checks are marked and ps-report data cached
    if (requiresMarking) {
      await markingService.process()
    }
    if (requiresProcessing) {
      await checkProcessingService.process()
    }

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
}

main(options)
  .then(() => {
    poolService.drain()
  })
  .catch(e => {
    console.warn(e)
    poolService.drain()
  })
