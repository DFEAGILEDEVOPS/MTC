'use strict'

const psychometricianReportService = require('./service/psychometrician-report.service')

const v1 = {
  process: async function process (logger) {
    try {
      await psychometricianReportService.setLogger(logger).process()
      return {
        processCount: 1
      }
    } catch (error) {
      logger.error('ERROR: v1.proccess(): ' + error.message)
      throw error
    }
  }
}

module.exports = v1
