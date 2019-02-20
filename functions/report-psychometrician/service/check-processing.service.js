'use strict'

const psychometricianReportDataService = require('./data-service/psychometrician-report-cache.data.service')
const psychometricianReportService = require('./psychometrician-report.service')
const anomalyReportService = require('./anomaly-report.service')

const checkProcessingService = {}
const batchSize = 100

/**
 * A process that runs until all checks have been processed
 * Processing consists of 1) add processed flag and 2) creating psychometrician report data
 * @return {Promise.<void>}
 */
checkProcessingService.process = async function (logger) {
  try {
    let hasWorkToDo = await psychometricianReportDataService.sqlHasUnprocessedStartedChecks()
    if (!hasWorkToDo) {
      logger.info('checkProcessingService.process: nothing to do')
    }
    while (hasWorkToDo) {
      await checkProcessingService.cachePsychometricanReportData(batchSize)
      hasWorkToDo = await psychometricianReportDataService.sqlHasUnprocessedStartedChecks()
    }
  } catch (error) {
    logger.error(`checkProcessingService.process: Bailing out: ${error.message}`, error)
    throw error
  }
}

/**
 * Get checks ids that will be used to cache psychometrician report data
 * @param {Number} batchSize
 * @param {function} logger
 * @returns {Boolean}
 */

checkProcessingService.cachePsychometricanReportData = async function (batchSize, logger) {
  const batchIds = await psychometricianReportDataService.sqlFindUnprocessedStartedChecks(batchSize)

  if (batchIds.length === 0) {
    logger.info('checkProcessingService.cachePsychometricanReportData: No IDs found')
    return false
  }

  // Produce and cache the Psychometrician data
  await psychometricianReportService.batchProduceCacheData(batchIds)

  // Produce and cache the Anomaly report data
  await anomalyReportService.batchProduceCacheData(batchIds)

  logger.info(`checkProcessingService.cachePsychometricanReportData: Processed ${batchIds.length} checks`)
  return true
}

module.exports = checkProcessingService
