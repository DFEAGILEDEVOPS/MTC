'use strict'

const checkDataService = require('./data-access/check.data.service')
const psychometricianReportService = require('./psychometrician-report.service')
const winston = require('winston')

const checkProcessingService = {}
const batchSize = 100

/**
 * A process that runs until all checks have been processed
 * Processing consists of 1) add processed flag and 2) creating psychometrician report data
 * @return {Promise.<void>}
 */
checkProcessingService.process = async function () {
  try {
    let hasWorkToDo = await checkDataService.sqlHasUnprocessed()
    if (!hasWorkToDo) {
      winston.info('Processing: nothing to do')
    }
    while (Array.isArray(hasWorkToDo) && hasWorkToDo.length > 0) {
      await this.cachePsychometricanReportData(batchSize)
      hasWorkToDo = await checkDataService.sqlHasUnprocessed()
    }
  } catch (error) {
    console.error('Bailing out: ', error)
  }
}

/**
 * Get checks ids that will be used to cache psychometrician report data
 * @param {Number} batchSize
 * @returns {Boolean}
 */

checkProcessingService.cachePsychometricanReportData = async function (batchSize) {
  const batchIds = await checkDataService.sqlFindUnprocessed(batchSize)

  if (batchIds.length === 0) {
    winston.info('No IDs found')
    return false
  }
  // Produce and cache the Pschometrician data
  await psychometricianReportService.batchProduceCacheData(batchIds)

  winston.info('Processed %d checks', batchIds.length)
  return true
}

module.exports = checkProcessingService
