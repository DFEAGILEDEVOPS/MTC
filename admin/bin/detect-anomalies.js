#!/usr/bin/env node
'use strict'

require('dotenv').config()
const winston = require('winston')
const fs = require('fs')
winston.level = 'info'

const anomalyReportCacheDataService = require('../services/data-access/anomaly-report-cache.data.service')
const anomalyReportService = require('../services/anomaly-report.service')
const checkProcessingService = require('../services/check-processing.service')
const commandLineArgs = require('command-line-args')
const markingService = require('../services/marking.service')
const poolService = require('../services/data-access/sql.pool.service')
const psychometricianReportCacheDataService = require('../services/data-access/psychometrician-report-cache.data.service')

let requiresMarking = false
let requiresProcessing = false

const optionDefinitions = [
  { name: 'forceReprocess', alias: 'f', type: Boolean },
  { name: 'marking', alias: 'm', type: Boolean },
  { name: 'process', alias: 'p', type: Boolean }
]

const options = commandLineArgs(optionDefinitions)

async function main () {
  try {
    if (options.forceReprocess) {
      // force the report to re-calculate the cached ps-report
      winston.info('force detected: re-processing all checks')
      await psychometricianReportCacheDataService.sqlDeleteAll()
      await anomalyReportCacheDataService.sqlDeleteAll()
    }
    if (options.marking) {
      requiresMarking = true
    }
    if (options.process) {
      requiresProcessing = true
    }

    winston.info('main: Processing the completed checks')
    // Make sure all completed checks are marked and ps-report + anomaly data cached
    if (requiresMarking) {
      await markingService.process()
    }
    if (requiresProcessing) {
      await checkProcessingService.process()
    }

    const report = await anomalyReportService.generateReport()
    const filename = 'anomalies.csv'
    fs.writeFileSync(filename, report)
    winston.info('Generated anomaly report: ' + filename)
  } catch (error) {
    winston.error(error)
  }
}

main()
  .then(() => {
    poolService.drain()
  })
  .catch(e => {
    console.warn(e)
    poolService.drain()
  })
