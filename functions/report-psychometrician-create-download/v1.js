'use strict'

const psychometricianReportService = require('./service/psychometrician-report.service')

const v1 = {
  process: async function process (context) {
    await psychometricianReportService.process()
    return {
      processCount: 1
    }
  }
}

module.exports = v1
