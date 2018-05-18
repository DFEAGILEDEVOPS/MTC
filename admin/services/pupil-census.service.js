'use strict'
const uuidv4 = require('uuid/v4')
const moment = require('moment')
const csv = require('fast-csv')
const fs = require('fs-extra')

const config = require('../config')
const azureFileDataService = require('./data-access/azure-file.data.service')
const pupilCensusDataService = require('./data-access/pupil-census.data.service')

const pupilCensusMaxSize = config.Data.pupilCensusMaxSize
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
          const blobResult = await pupilCensusService.uploadToBlobStorage(csvDataArray)
          const pupilCensusRecord = {
            name: uploadFile.filename && uploadFile.filename.replace(/\.[^/.]+$/, ''),
            blobFileName: blobResult && blobResult.name,
            status: 'Processing pending'
          }
          await pupilCensusDataService.sqlCreate(pupilCensusRecord)
          return resolve(uploadFile.filename)
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
  const streamLength = pupilCensusMaxSize
  const remoteFilename = `${uuidv4()}_${moment().format('YYYYMMDDHHmmss')}.csv`
  const csvFileStream = uploadFile.join('\n')
  return azureFileDataService.azureUploadFile('censusupload', remoteFilename, csvFileStream, streamLength)
}

/**
 * Get existing pupil census file
 * @return {Object}
 */
pupilCensusService.getUploadedFile = async () => {
  return pupilCensusDataService.sqlFindOne()
}

module.exports = pupilCensusService
