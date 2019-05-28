'use strict'

const psychometricianReportDataService = require('./data-service/psychometrician-report-cache.data.service')
const psychometricianReportService = require('./psychometrician-report.service')
const anomalyReportService = require('./anomaly-report.service')

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

module.exports = checkProcessingService
