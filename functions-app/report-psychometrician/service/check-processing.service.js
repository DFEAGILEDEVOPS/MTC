'use strict'

const psychometricianReportDataService = require('./data-service/psychometrician-report-cache.data.service')
const psychometricianReportService = require('./psychometrician-report.service')
const anomalyReportService = require('./anomaly-report.service')

const checkProcessingService = {}

/**
 * Get checks ids that will be used to cache psychometrician report data
 * @param {Number} batchSize
 * @param {context} Function execution context
 * @returns {{processCount}}
 */

checkProcessingService.cachePsychometricanReportData = async function (batchSize, context) {
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
      await psychometricianReportService.batchProduceCacheData(batchIds, context)

      // Produce and cache the Anomaly report data
      await anomalyReportService.batchProduceCacheData(batchIds, context)
    } catch (error) {
      context.log.error('ERROR: checkProcessingService.cachePsychometricanReportData: ' + error.message)
      throw error
    }
  } else {
    context.log('psychometrician-report: no work to do')
  }

  return {
    processCount: batchIds.length
  }
}

module.exports = checkProcessingService
