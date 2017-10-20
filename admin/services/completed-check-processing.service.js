'use strict'

const completedCheckDataService = require('./data-access/completed-check.data.service')
const markingService = require('./marking.service')

const completedCheckProcessingService = {}
const batchSize = 100

/**
 * A process that runs until all completedChecks have been processed
 * Processing consists of 1) marking and 2) creating psychometrician report data
 * @return {Promise.<void>}
 */
completedCheckProcessingService.process = async function () {
  try {
    let hasWorkToDo = await completedCheckDataService.hasUnmarked()
    if (!hasWorkToDo) {
      console.log('Nothing to do')
    }
    while (hasWorkToDo) {
      await this.markAndProcess(batchSize)
      hasWorkToDo = await completedCheckDataService.hasUnmarked()
    }
  } catch (error) {
    console.error('Bailing out: ', error)
  }
}

completedCheckProcessingService.markAndProcess = async function (batchSize) {
  const batchIds = await completedCheckDataService.findUnmarked(batchSize)
  if (batchIds.length === 0) {
    console.log('No documents IDs found')
    return false
  }
  await markingService.batchMark(batchIds)
  console.log('Processed %d completed checks', batchIds.length)
  return true
}

module.exports = completedCheckProcessingService
