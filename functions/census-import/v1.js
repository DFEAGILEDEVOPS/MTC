'use strict'
const csvString = require('csv-string')
const moment = require('moment')
const R = require('ramda')
const uuidv4 = require('uuid/v4')

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
    await jobDataService.sqlUpdateStatus(pool, jobUrlSlug, 'PRC')

    const blobContent = csvString.parse(blob.toString())
    const censusTable = `[mtc_census_import].[census_import_${moment.utc().format('YYYYMMDDHHMMSS')}_${uuidv4()}]`
    const stagingInsertCount = await censusImportDataService.sqlLoadStagingTable(context, pool, censusTable, blobContent)
    const pupilMeta = await censusImportDataService.sqlLoadPupilsFromStaging(context, pool, censusTable)

    await censusImportDataService.sqlDeleteStagingTable(context, pool, censusTable)
    const azureBlobService = azureStorageHelper.getPromisifiedAzureBlobService()
    await azureBlobService.deleteContainerAsync('census')

    if (stagingInsertCount !== pupilMeta['insertCount']) {
      const errorOutput = `${stagingInsertCount} rows staged, but only ${pupilMeta['insertCount']} rows inserted to pupil table`
      await jobDataService.sqlUpdateStatus(pool, jobUrlSlug, 'CWR', undefined, errorOutput)
      context.log.warn(`census-import: ${errorOutput}`)
    } else {
      const jobOutput = `${stagingInsertCount} rows staged and ${pupilMeta['insertCount']} rows inserted to pupil table`
      await jobDataService.sqlUpdateStatus(pool, jobUrlSlug, 'COM', jobOutput)
    }

    return pupilMeta['insertCount']
  }
}

module.exports = v1
