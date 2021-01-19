const { v4: uuidv4 } = require('uuid')
const moment = require('moment')
const csv = require('fast-csv')
const azureFileDataService = require('./data-access/azure-file.data.service')

const service = {}
service.generate = async (school, headers, csvData) => {
  const errorsCsv = []
  headers.push('Errors')
  errorsCsv.push(headers)
  csvData.forEach((p) => errorsCsv.push(p))
  const csvStr = await csv.writeToString(errorsCsv, { headers: true })
  // Upload csv to Azure
  let file
  try {
    const remoteFilename = `${school.id}_${uuidv4()}_${moment().format('YYYYMMDDHHmmss')}_error.csv`
    const streamLength = 512 * 1000
    file = await azureFileDataService.azureUploadFile('csvuploads', remoteFilename, csvStr, streamLength)
  } catch (error) {
    return { hasError: true, error }
  }
  return { file }
}

module.exports = service
