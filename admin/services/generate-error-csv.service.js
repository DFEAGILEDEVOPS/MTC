const { v4: uuidv4 } = require('uuid')
const moment = require('moment')
const csv = require('fast-csv')
const azureBlobDataService = require('./data-access/azure-blob.data.service')

const service = {}
service.generate = async (school, headers, csvData) => {
  const errorsCsv = []
  headers.push('Errors')
  errorsCsv.push(headers)
  csvData.forEach((p) => errorsCsv.push(p))
  // Upload csv to Azure
  let remoteFilename
  try {
    const csvStr = await csv.writeToString(errorsCsv, { headers: true })
    remoteFilename = `${school.id}_${uuidv4()}_${moment().format('YYYYMMDDHHmmss')}_error.csv`
    await azureBlobDataService.uploadData('csvuploads', remoteFilename, Buffer.from(csvStr))
  } catch (error) {
    return { hasError: true, error }
  }
  return { remoteFilename, hasError: false }
}

module.exports = service
