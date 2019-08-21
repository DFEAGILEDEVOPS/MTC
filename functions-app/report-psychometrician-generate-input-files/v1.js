'use strict'

const dataService = require('./service/data.service')

const v1 = {
  process: async function process (logger) {
    try {
      console.log('do some work')
      await dataService.setLogger(logger).dumpFiles()
    } catch (error) {
      logger.error('ERROR: v1.process(): ' + error.message)
      throw error
    }
  }
}

module.exports = v1
