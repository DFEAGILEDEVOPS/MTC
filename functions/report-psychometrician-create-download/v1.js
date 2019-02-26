'use strict'

const psychometricianReportService = require('./service/psychometrician-report.service')

const v1 = {
  process: async function process (context) {
    try {
      await psychometricianReportService.process()
      return {
        processCount: 1
      }
    } catch (error) {
      context.log('ERROR: v1.proccess(): ' + error.message)
      throw error
    }
  }
}

module.exports = v1
