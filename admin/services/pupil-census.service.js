'use strict'
const uuidv4 = require('uuid/v4')
const moment = require('moment')
const csv = require('fast-csv')
const fs = require('fs-extra')

const config = require('../config')
const azureFileDataService = require('./data-access/azure-file.data.service')
const jobDataService = require('./data-access/job.data.service')
const jobStatusDataService = require('./data-access/job-status.data.service')

const pupilCensusMaxSizeFileUploadMb = config.Data.pupilCensusMaxSizeFileUploadMb
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
  const streamLength = pupilCensusMaxSizeFileUploadMb
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
  let dataInput = []
  const csvName = uploadFile.filename && uploadFile.filename.replace(/\.[^/.]+$/, '')
  const blobFileName = blobResult && blobResult.name
  dataInput.push(csvName, blobFileName)
  dataInput = JSON.stringify(dataInput.join(','))
  const pupilCensusRecord = {
    input: dataInput,
    jobStatusCode: 'SUB',
    jobTypeCode: 'CEN'
  }
  await jobDataService.sqlCreate(pupilCensusRecord)
}

/**
 * Get existing pupil census file
 * @return {Object}
 */
pupilCensusService.getUploadedFile = async () => {
  const pupilCensus = await jobDataService.sqlFindLatestByType('CEN')
  if (!pupilCensus) return
  const jobStatusCode = pupilCensus.jobStatusCode
  if (!jobStatusCode) {
    throw new Error('Pupil census record does not have a job status reference')
  }
  const jobStatus = await jobStatusDataService.sqlFindOneByCode(jobStatusCode)
  const dataInput = pupilCensus.input && JSON.parse(pupilCensus.input)
  pupilCensus.jobStatus = jobStatus && jobStatus.description
  pupilCensus.csvName = dataInput.split(',')[0]
  return pupilCensus
}

module.exports = pupilCensusService
