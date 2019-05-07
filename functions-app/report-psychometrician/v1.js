'use strict'

const checkProcessingService = require('./service/check-processing.service')

const v1 = {
  process: async function process (context) {
    try {
      context.log.info('Running psychometrician report')
      return checkProcessingService.cachePsychometricanReportData(100, context)
    } catch (error) {
      context.log.error(`report-psychometrician: checkProcessingService: error: ${error.message}`)
      throw error
    }
  }
}

module.exports = v1
