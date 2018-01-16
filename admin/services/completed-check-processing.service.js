'use strict'

const completedCheckDataService = require('./data-access/completed-check.data.service')
const markingService = require('./marking.service')
const psychometricianReportService = require('./psychometrician-report.service')
const winston = require('winston')

const completedCheckProcessingService = {}
const batchSize = 100

/**
 * A process that runs until all completedChecks have been processed
 * Processing consists of 1) marking and 2) creating psychometrician report data
 * @return {Promise.<void>}
 */
completedCheckProcessingService.process = async function () {
  try {
    let hasWorkToDo = await completedCheckDataService.sqlHasUnmarked()
    if (!hasWorkToDo) {
      winston.info('Processing: nothing to do')
    }
    while (hasWorkToDo) {
      await this.markAndProcess(batchSize)
      hasWorkToDo = await completedCheckDataService.sqlHasUnmarked()
    }
  } catch (error) {
    console.error('Bailing out: ', error)
  }
}

completedCheckProcessingService.markAndProcess = async function (batchSize) {
  const batchIds = await completedCheckDataService.sqlFindUnmarked(batchSize)
  if (batchIds.length === 0) {
    winston.info('No documents IDs found')
    return false
  }
  await markingService.batchMark(batchIds)
  await psychometricianReportService.batchProduceCacheData(batchIds)
  winston.info('Processed %d completed checks', batchIds.length)
  return true
}

module.exports = completedCheckProcessingService
