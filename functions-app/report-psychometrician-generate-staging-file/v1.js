'use strict'

const moment = require('moment')
const fse = require('fs-extra')
const async = require('async')
const path = require('path')

const dataService = require('./service/data.service')
const dateService = require('../lib/date.service')
const functionName = 'ps-report-staging'

const v1 = {
  process: async function exec (logger) {
    try {
      const startDate = moment()
      const startTs = dateService.formatIso8601(startDate)
      logger.info(`${functionName} v1: starting work: ${startTs}`)
      dataService.setLogger(logger)
      logger.verbose(`${functionName} fetching SQL details...`)
      const stage1Filename = await dataService.dumpStage1File()
      logger.verbose(`${functionName} fetching table storage entities`)
      const stage2Filename = await dataService.writeStage2File(stage1Filename)

      logger.verbose(`${functionName} uploading ${stage2Filename} to blob storage`)
      await dataService.uploadToBlobStorage(stage2Filename)

      // Cleanup
      logger.verbose(`${functionName}: about to delete staging files`)
      await async.parallel({
        deleteStage1: async () => fse.unlink(stage1Filename),
        deleteStage2: async () => fse.unlink(stage2Filename)
      })
      await async.parallel({
        deleteStage1Dir: async () => fse.rmdir(path.dirname(stage1Filename)),
        deleteStage2Dir: async () => fse.rmdir(path.dirname(stage2Filename))
      })
      logger.verbose(`${functionName}: deleted remote staging files (stage1, stage2)`)

      const endDate = moment()
      const endTs = dateService.formatIso8601(endDate)
      logger.info(`${functionName} v1: completed work: ${endTs}`)
    } catch (error) {
      logger.error(`${functionName} ERROR: v1.process(): ` + error.message)
      throw error
    }
  }
}

module.exports = v1
