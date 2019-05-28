'use strict'

const psychometricianReportService = require('./service/psychometrician-report.service')

const v1 = {
  process: async function process (logger) {
    try {
      await psychometricianReportService.setLogger(logger).process()
    } catch (error) {
      logger.error('ERROR: v1.process(): ' + error.message)
    }
  }
}

module.exports = v1
