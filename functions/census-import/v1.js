'use strict'
const csvString = require('csv-string')
const moment = require('moment')
const uuidv4 = require('uuid/v4')

const censusImportDataService = require('./census-import.data.service')

const v1 = {
  process: async function (context, blob) {
    const rowsModified = await this.handleCensusImport(context, blob)
    return {
      processCount: rowsModified
    }
  },

  handleCensusImport: async function (context, blob) {
    const blobContent = csvString.parse(blob.toString())
    const censusTable = `[mtc_admin].[census-import-${moment.utc().format('YYYYMMDDHHMMSS')}-${uuidv4()}]`
    await censusImportDataService.sqlCreateCensusImportTable(context, censusTable, blobContent)
    return censusImportDataService.sqlInsertCensusImportTableData(context, censusTable)
  }
}

module.exports = v1
