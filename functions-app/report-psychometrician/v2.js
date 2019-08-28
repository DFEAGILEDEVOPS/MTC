'use strict'

const checkProcessingService = require('./service/check-processing.service')

const functionName = 'report-psychometrician v2'
require('dotenv').config()

let logger

const v2 = {
  process: async function exec (loggerArg) {
    logger = loggerArg
    const meta = {
      processCount: 0,
      errorCount: 0
    }
    logger.info(`${functionName}: v2.process() called`)
    try {
      const data = await checkProcessingService.generateReportsFromFile(logger, process.env.PS_INPUT_FILE)
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
