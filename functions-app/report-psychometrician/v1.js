
'use strict'

const checkProcessingService = require('./service/check-processing.service')
const functionName = 'report-psychometrician'
const maxAllowedErrors = 100
let logger

const v1 = {
  process: async function process (loggerArg) {
    logger = loggerArg
    const meta = {
      processCount: 0,
      errorCount: 0
    }
    logger.info(`${functionName}: v1.process() called`)
    let data
    do {
      try {
        data = await checkProcessingService.cachePsychometricanReportData(100, logger)
        meta.processCount += data.processCount
        if (meta.processCount % 1000 === 0) {
          logger(`${functionName}: ${meta.processCount} checks processed`)
        }
      } catch (error) {
        logger.error(`${functionName}: Error during processing: ${error.message}`, error)
        meta.errorCount += 1
      }
    } while (checkProcessingService.hasWorkToDo() && meta.errorCount < maxAllowedErrors)
    return meta
  }
}

module.exports = v1
