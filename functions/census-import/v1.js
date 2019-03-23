'use strict'
const csvString = require('csv-string')
const moment = require('moment')
const R = require('ramda')
const uuidv4 = require('uuid/v4')

const censusImportDataService = require('./census-import.data.service')
const jobDataService = require('./job.data.service')

const v1 = {
  process: async function (context, blob) {
    const rowsAffected = await this.handleCensusImport(context, blob)
    return {
      processCount: rowsAffected
    }
  },

  handleCensusImport: async function (context, blob) {
    const jobUrlSlug = R.compose(arr => arr[arr.length - 1], r => r.split('/'))(context.bindingData.uri)
    // Update job status to Processing
    await jobDataService.sqlUpdateStatus(jobUrlSlug, 'PRC')

    const blobContent = csvString.parse(blob.toString())
    const censusTable = `[mtc_census_import].[census_import_${moment.utc().format('YYYYMMDDHHMMSS')}_${uuidv4()}]`
    const result = await censusImportDataService.sqlLoadStagingTable(context, censusTable, blobContent)
    await censusImportDataService.sqlLoadPupilsFromStaging(context, censusTable)
    return result
  }
}

module.exports = v1
