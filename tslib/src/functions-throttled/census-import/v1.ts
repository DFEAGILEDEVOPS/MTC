'use strict'
const csvString = require('csv-string')
const moment = require('moment')
const R = require('ramda')
const { v4: uuidv4 } = require('uuid')

const censusImportDataService = require('./census-import.data.service')
const azureStorageHelper = require('../lib/azure-storage-helper')
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

    const pool = await censusImportDataService.initPool(context)

    // Update job status to Processing
    const jobId = await jobDataService.sqlUpdateStatus(pool, jobUrlSlug, 'PRC')

    const blobContent = csvString.parse(blob.toString())
    const censusTable = `[mtc_census_import].[census_import_${moment.utc().format('YYYYMMDDHHMMSS')}_${uuidv4()}]`
    const stagingInsertCount = await censusImportDataService.sqlLoadStagingTable(context, pool, censusTable, blobContent)
    const pupilMeta = await censusImportDataService.sqlLoadPupilsFromStaging(context, pool, censusTable, jobId)

    await censusImportDataService.sqlDeleteStagingTable(context, pool, censusTable)
    const azureBlobService = azureStorageHelper.getPromisifiedAzureBlobService()
    await azureBlobService.deleteContainerAsync('census')

    const jobOutput = `${stagingInsertCount} rows in uploaded file, ${pupilMeta.insertCount} inserted to pupil table, ${pupilMeta.errorCount} rows containing errors`

    if (stagingInsertCount !== pupilMeta.insertCount) {
      const errorOutput = pupilMeta.errorText
      await jobDataService.sqlUpdateStatus(pool, jobUrlSlug, 'CWR', jobOutput, errorOutput)
      context.log.warn(`census-import: ${stagingInsertCount} rows staged, but only ${pupilMeta.insertCount} rows inserted to pupil table`)
    } else {
      const jobOutput = `${stagingInsertCount} rows staged and ${pupilMeta.insertCount} rows inserted to pupil table`
      await jobDataService.sqlUpdateStatus(pool, jobUrlSlug, 'COM', jobOutput)
    }

    return pupilMeta.insertCount
  }
}

module.exports = v1
