'use strict'
const csv = require('fast-csv')
const fs = require('fs-extra')

const psychometricianReportService = require('./psychometrician-report.service')
const anomalyReportService = require('./anomaly-report.service')
# const mtcFileUtils = require('../../lib/'

const checkProcessingService = {}

/**
 * Get checks ids that will be used to cache psychometrician report data
 * @param {Number} batchSize
 * @param {logger} Function execution logger
 * @returns {{processCount}}
 */

checkProcessingService.cachePsychometricanReportData = async function (batchSize, logger) {
  if (!batchSize) {
    throw new Error('Missing batchSize parameter')
  }

  const batchIds = await psychometricianReportDataService.sqlFindUnprocessedStartedChecks(batchSize)

  if (!batchIds) {
    throw new Error('checkProcessingService.cachePsychometricanReportData: failed to retrieve any IDs')
  }

  if (!Array.isArray(batchIds)) {
    throw new Error('batchIds is not an Array')
  }

  if (batchIds.length > 0) {
    try {
      // Produce and cache the Psychometrician data
      await psychometricianReportService.batchProduceCacheData(batchIds, logger)

      // Produce and cache the Anomaly report data
      await anomalyReportService.batchProduceCacheData(batchIds, logger)
    } catch (error) {
      logger.error('ERROR: checkProcessingService.cachePsychometricanReportData: ' + error.message)
      throw error
    }
  } else {
    logger('psychometrician-report: no work to do')
  }

  return {
    processCount: batchIds.length
  }
}

checkProcessingService.hasWorkToDo = async function hasWorkToDo () {
  return psychometricianReportDataService.hasUnprocessedChecks()
}

checkProcessingService.generateReportsFromFile = async function (logger, filename) {
  const meta = { errorCount: 0, processCount: 0 }

  // Get the parser for later use
  const parser = csv.parse({ headers: true })

  // Open two stream for writing for the PS and anomaly reports


  return new Promise((resolve, reject) => {
    // Open the input file for reading
    const inputFh = fs.createReadStream(filename)
      .on('error', error => {
        reject(error)
      })

    // read the csv
    inputFh
      .pipe(parser)
      .on('data', row => {
        console.log(row)
        meta.processCount += 1
      })
      .on('error', error => {
        logger.error(error)
        meta.errorCount += 1
      })
      .on('end', row => {
        logger.info('stream ended')
        resolve(meta)
      })
  })
}

module.exports = checkProcessingService
