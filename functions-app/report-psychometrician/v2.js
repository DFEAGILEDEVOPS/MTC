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

const azure = require('azure-storage')
const checkProcessingService = require('./service/check-processing.service')

const functionName = 'report-psychometrician v2'

let logger

const v2 = {
  process: async function exec (loggerArg, blob) {
    logger = loggerArg
    logger.info(`${functionName}: v2.process() called`)
    let meta = {}
    let stagingFileProperties

    try {
      stagingFileProperties = JSON.parse(blob)
    } catch (error) {
      logger.error('Failed to parse trigger details')
      throw error
    }

    try {
      meta = await checkProcessingService.generateReportsFromFile(logger, stagingFileProperties)
      checkProcessingService.setLogger(logger)
      await checkProcessingService.makeReportsAvailable([meta.psreport.localFilename, meta.anomaly.localFilename])
      await this.cleanup(stagingFileProperties)
    } catch (error) {
      logger.error(`${functionName}: Error during processing: ${error.message}`, error)
    }

    logger.info(`${functionName}: v2.process() finished`)
    logger.info(`Time taken: ${meta.durationInMins}`)
    return meta
  },

  cleanup: async function cleanup (stagingFileProperties) {
    await this.deleteBlob(stagingFileProperties)
    const triggerFilename = path.basename(stagingFileProperties.name, '.csv').concat('.trigger.json')
    await this.deleteBlob({ container: stagingFileProperties.container, name: triggerFilename })
  },

  deleteBlob: async function deleteBlob (blobProperties) {
    logger.verbose(`${functionName} Deleting staging file ${blobProperties.container}/${blobProperties.name}`)
    const blobService = azure.createBlobService()
    return new Promise((resolve, reject) => {
      blobService.deleteBlobIfExists(blobProperties.container, blobProperties.name, (error, result) => {
        if (error) { return reject(error) }
        resolve(result)
      })
    })
  }
}

module.exports = v2
