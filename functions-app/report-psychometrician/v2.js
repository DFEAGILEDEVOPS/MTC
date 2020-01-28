'use strict'
const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '..', '.env')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}
const checkProcessingService = require('./service/check-processing.service')

const functionName = 'report-psychometrician v2'

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
