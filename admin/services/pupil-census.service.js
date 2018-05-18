'use strict'
const uuidv4 = require('uuid/v4')
const moment = require('moment')
const csv = require('fast-csv')
const fs = require('fs-extra')
const { promisify } = require('bluebird')

// const writeToString = promisify(csv.writeToString)

const azureFileDataService = require('./data-access/azure-file.data.service')

const pupilCensusService = {}

/**
 * Upload handler
 * @param uploadFile
 * @return {Promise<void>}
 */
pupilCensusService.upload = async (uploadFile) => {
  let stream
  return new Promise((resolve, reject) => {
    let csvDataArray = []
    stream = fs.createReadStream(uploadFile.file)
    csv.fromStream(stream)
      .on('data', (data) => {
        // clear extra spaces in empty rows
        const row = data && data.map(r => r.trim())
        csvDataArray.push(row)
      })
      .on('end', async () => {
        try {
          const response = await pupilCensusService.uploadToBlobStorage(csvDataArray)
          return resolve(response)
        } catch (error) {
          reject(error)
        }
      })
  })
}

/**
 * Upload stream to Blob Storage
 * @param uploadFile
 * @return {Promise<void>}
 */
pupilCensusService.uploadToBlobStorage = async (uploadFile) => {
  // Limit to 100 MB
  const streamLength = 100 * 1024 * 1024
  const remoteFilename = `${uuidv4()}_${moment().format('YYYYMMDDHHmmss')}.csv`
  const csvFileStream = uploadFile.join('\n')
  return azureFileDataService.azureUploadFile('censusupload', remoteFilename, csvFileStream, streamLength)
}

module.exports = pupilCensusService
