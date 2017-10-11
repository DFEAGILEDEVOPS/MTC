const uuidv4 = require('uuid/v4')
const moment = require('moment')
const { promisify } = require('bluebird')
const csv = require('fast-csv')
const { azureUploadFile } = require('./data-access/azure-file.data.service')

module.exports.generate = async (school, headers, csvData, resolve) => {
  const errorsCsv = []
  headers.push('Errors')
  errorsCsv.push(headers)
  csvData.forEach((p) => errorsCsv.push(p))
  const writeToString = promisify(csv.writeToString)
  const csvStr = await writeToString(errorsCsv, { headers: true })
// Upload csv to Azure
  let csvBlobFile
  try {
    const remoteFilename = `${school._id}_${uuidv4()}_${moment().format('YYYYMMDDHHmmss')}_error.csv`
    const streamLength = 512 * 1000
    csvBlobFile = await azureUploadFile('csvuploads', remoteFilename, csvStr, streamLength)
  } catch (error) {
    return resolve({ error })
  }
  return csvBlobFile
}
