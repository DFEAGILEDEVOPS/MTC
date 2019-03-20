'use strict'
const csvString = require('csv-string')

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
    return censusImportDataService.sqlCreateCensusImportTable(context, blobContent)
  }
}

module.exports = v1
