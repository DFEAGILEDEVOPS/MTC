'use strict'

const moment = require('moment')

const dataService = require('./service/data.service')
const dateService = require('./service/date.service')

const v1 = {
  process: async function exec (logger) {
    try {
      const startDate = moment()
      const startTs = dateService.formatIso8601(startDate)
      logger.info(`v1: starting work: ${startTs}`)
      dataService.setLogger(logger)
      await dataService.dumpFiles()
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
