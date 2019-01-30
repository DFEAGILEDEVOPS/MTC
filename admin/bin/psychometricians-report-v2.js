#!/usr/bin/env node
'use strict'

require('dotenv').config()
const fs = require('fs')
const logger = require('../services/log.service').getLogger()
const sqlService = require('../services/data-access/sql.service')
const commandLineArgs = require('command-line-args')
const markingService = require('../services/marking.service')
const checkProcessingService = require('../services/check-processing.service')
const anomalyReportCacheDataService = require('../services/data-access/anomaly-report-cache.data.service')
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
    logger.info('force detected: re-processing all checks')
    if (options.forceReprocess) {
      if (options.marking) {
        // force a re-mark
        await sqlService.modify('UPDATE [mtc_admin].[check] SET markedAt=null, mark=null, maxMark=null')
        await sqlService.modify('DELETE FROM [mtc_admin].[answer]')
      }
      // force the report to re-calculate the cached ps-report
      await psychometricianReportCacheDataService.sqlDeleteAll()
      await anomalyReportCacheDataService.sqlDeleteAll()
    }
    if (options.marking) {
      requiresMarking = true
    }
    if (options.process) {
      requiresProcessing = true
    }

    logger.info('main: Processing the completed checks')
    // Make sure all completed checks are marked and ps-report + anomaly data cached
    if (requiresMarking) {
      await markingService.process()
    }
    if (requiresProcessing) {
      await checkProcessingService.process()
    }

    const report = await psychometricianReportService.generateReport()
    const filename = 'mtc-check.csv'
    fs.writeFileSync(filename, report)
    logger.info('Generated psychometric report: ' + filename)

    // Also generate a filtered version of the report, suitable for our customers
    //   const scoreReport = await psychometricianReportService.generateScoreReport()
    //   const filename2 = 'mtc-scores.csv'
    //   fs.writeFileSync(filename2, scoreReport)
    //   winston.info('Generated score report: ' + filename2)
  } catch (error) {
    logger.error(error)
  }
}

;(async function () {
    await main(options)
    process.exit(0)
})()

