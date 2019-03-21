'use strict'
const csvString = require('csv-string')
const moment = require('moment')
const uuidv4 = require('uuid/v4')

const censusImportDataService = require('./census-import.data.service')

const v1 = {
  process: async function (context, blob) {
    const rowsAffected = await this.handleCensusImport(context, blob)
    return {
      processCount: rowsAffected
    }
  },

  handleCensusImport: async function (context, blob) {
    const blobContent = csvString.parse(blob.toString())
    const censusTable = `[mtc_admin].[census-import-${moment.utc().format('YYYYMMDDHHMMSS')}-${uuidv4()}]`
    const result = await censusImportDataService.sqlCreateCensusImportTable(context, censusTable, blobContent)
    await censusImportDataService.sqlUpsertCensusImportTableData(context, censusTable)
    return result
  }
}

module.exports = v1
