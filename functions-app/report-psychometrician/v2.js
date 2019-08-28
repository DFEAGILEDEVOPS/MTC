'use strict'

const checkProcessingService = require('./service/check-processing.service')
const functionName = 'report-psychometrician'
let logger

const v2 = {
  process: async function process (loggerArg) {
    logger = loggerArg
    const meta = {
      processCount: 0,
      errorCount: 0
    }
    logger.info(`${functionName}: v1.process() called`)
    try {
      const data = await checkProcessingService.generateReportsFromFile(logger, '../report-psychometrician-generate-input-files/PS-REPORT-EXTRACT-TEMP-y5waQp/custom-check-data.csvXX')
      meta.processCount += data.processCount
      if (meta.processCount % 1000 === 0) {
        logger(`${functionName}: ${meta.processCount} checks processed`)
      }
    } catch (error) {
      logger.error(`${functionName}: Error during processing: ${error.message}`, error)
      meta.errorCount += 1
    }

    return meta
  }
}

module.exports = v2
