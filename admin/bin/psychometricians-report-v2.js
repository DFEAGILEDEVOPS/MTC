#!/usr/bin/env node
'use strict'

require('dotenv').config()
const fs = require('fs')
const logger = require('../services/log.service').getLogger()
const commandLineArgs = require('command-line-args')
const checkProcessingService = require('../../functions/report-psychometrician/service/check-processing.service')
const anomalyReportCacheDataService = require('../services/data-access/anomaly-report-cache.data.service')
const psychometricianReportCacheDataService = require('../../functions/report-psychometrician/service/data-service/psychometrician-report-cache.data.service')
const psychometricianReportService = require('../../functions/report-psychometrician/service/psychometrician-report.service')

let requiresProcessing = false

const optionDefinitions = [
  { name: 'forceReprocess', alias: 'f', type: Boolean },
  { name: 'process', alias: 'p', type: Boolean }
]

const options = commandLineArgs(optionDefinitions)

async function main (options) {
  try {
    if (options.forceReprocess) {
      // force the report to re-calculate the cached ps-report
      logger.info('force detected: re-processing all checks')
      await psychometricianReportCacheDataService.sqlDeleteAll()
      await anomalyReportCacheDataService.sqlDeleteAll()
    }
    if (options.process) {
      requiresProcessing = true
    }

    logger.info('main: Processing the completed checks')
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

