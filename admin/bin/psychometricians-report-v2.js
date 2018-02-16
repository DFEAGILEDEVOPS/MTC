#!/usr/bin/env node
'use strict'

require('dotenv').config()
const fs = require('fs')
const winston = require('winston')
const poolService = require('../services/data-access/sql.pool.service')

const psychometricianReportCacheDataService = require('../services/data-access/psychometrician-report-cache.data.service')
const psychometricianReportService = require('../services/psychometrician-report.service')

async function main () {
  try {
    if (process.argv.length > 2) {
      if (process.argv[2] === '-f') {
        // force the report to re-calculate the cached ps-report
        winston.info('force detected: re-processing all checks')
        await psychometricianReportCacheDataService.sqlDeleteAll()
      }
    }

    winston.info('main: Processing the completed checks')

    // Just process everything in one batch.
    // TODO: batchify it in a service
    const checks = await psychometricianReportCacheDataService.sqlFindUnprocessedChecks()
    if (!checks || !checks.length) return
    await psychometricianReportService.batchProduceCacheData(checks.map(c => c.id))

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

main()
  .then(() => {
    poolService.drain()
  })
  .catch(e => {
    console.warn(e)
    poolService.drain()
  })
