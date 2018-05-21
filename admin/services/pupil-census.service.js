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
 * Upload handler for pupil census
 * Reads the file contents, calls the upload to blob storage method and the creation of the pupil census record
 * @param uploadFile
 * @return {Promise<void>}
 */
pupilCensusService.upload = async (uploadFile) => {
  let stream
  const csvData = await new Promise((resolve, reject) => {
    let dataArr = []
    stream = fs.createReadStream(uploadFile.file)
    csv.fromStream(stream)
      .on('data', (data) => {
        // clear extra spaces in empty rows
        const row = data && data.map(r => r.trim())
        dataArr.push(row)
      })
      .on('end', async () => {
        try {
          resolve(dataArr)
        } catch (error) {
          reject(error)
        }
      })
  })
  const blobResult = await pupilCensusService.uploadToBlobStorage(csvData)
  await pupilCensusService.create(uploadFile, blobResult)
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
 * Creates a new pupilCensus record
 * @param {Object} uploadFile
 * @param {Object} blobResult
 * @return {Object}
 */
pupilCensusService.create = async (uploadFile, blobResult) => {
  const pupilCensusRecord = {
    name: uploadFile.filename && uploadFile.filename.replace(/\.[^/.]+$/, ''),
    blobFileName: blobResult && blobResult.name,
    status: 'Processing pending'
  }
  await pupilCensusDataService.sqlCreate(pupilCensusRecord)
}

/**
 * Get existing pupil census file
 * @return {Object}
 */
pupilCensusService.getUploadedFile = async () => {
  return pupilCensusDataService.sqlFindOne()
}

module.exports = pupilCensusService
