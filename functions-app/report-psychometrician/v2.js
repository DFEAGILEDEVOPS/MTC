'use strict'

const checkProcessingService = require('./service/check-processing.service')

const functionName = 'report-psychometrician v2'
require('dotenv').config()

let logger

const v2 = {
  process: async function exec (loggerArg) {
    logger = loggerArg
    logger.info(`${functionName}: v2.process() called`)
    let meta = {}

    try {
      meta = await checkProcessingService.generateReportsFromFile(logger, process.env.PS_INPUT_FILE)
    } catch (error) {
      logger.error(`${functionName}: Error during processing: ${error.message}`, error)
    }

    logger.info(`${functionName}: v2.process() finished`)
    logger.info(`Time taken: ${meta.durationInMins}`)
    return meta
  }
}

module.exports = v2
