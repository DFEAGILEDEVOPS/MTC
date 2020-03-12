'use strict'

const moment = require('moment')
const fse = require('fs-extra')
const async = require('async')
const path = require('path')

const dataService = require('./service/data.service')
const dateService = require('./service/date.service')

const v1 = {
  process: async function exec (logger) {
    try {
      const startDate = moment()
      const startTs = dateService.formatIso8601(startDate)
      logger.info(`v1: starting work: ${startTs}`)
      dataService.setLogger(logger)
      logger.verbose('Fetching SQL details')
      const stage1Filename = await dataService.dumpStage1File()
      logger.verbose('Fetching Table Storage details')
      const stage2Filename = await dataService.writeStage2File(stage1Filename)
      console.log('Got stage2 ', stage2Filename)

      logger.verbose(`Uploading ${stage2Filename} to blob storage`)
      const uploadData = await dataService.uploadToBlobStorage(stage2Filename)

      // Cleanup
      logger.verbose('About to delete staging files')
      await async.parallel({
        deleteStage1: async () => fse.unlink(stage1Filename),
        deleteStage2: async () => fse.unlink(stage2Filename)
      })
      await async.parallel({
        deleteStage1Dir: async () => fse.rmdir(path.dirname(stage1Filename)),
        deleteStage2Dir: async () => fse.rmdir(path.dirname(stage2Filename))
      })
      logger.verbose('Deleted staging files')

      const endDate = moment()
      const endTs = dateService.formatIso8601(endDate)
      logger.info(`v1: completed work: ${endTs}`)
    } catch (error) {
      logger.error('ERROR: v1.process(): ' + error.message)
      throw error
    }
  }
}

module.exports = v1
