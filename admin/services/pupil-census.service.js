'use strict'
const csv = require('fast-csv')
const fs = require('fs-extra')

const jobDataService = require('./data-access/job.data.service')
const jobStatusDataService = require('./data-access/job-status.data.service')
const jobTypeDataService = require('./data-access/job-type.data.service')
const pupilCensusProcessingService = require('./pupil-census-processing.service')

const pupilCensusService = {}

/**
 * Upload handler for pupil census
 * Reads the file contents and creates of the pupil census record
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
  // Remove headers from csv
  csvData.shift()
  const submissionResult = await pupilCensusProcessingService.process(csvData)
  await pupilCensusService.create(uploadFile, submissionResult)
}

/**
 * Creates a new pupilCensus record
 * @param {Object} uploadFile
 * @param {Object} submissionResult
 * @return {Object}
 */
pupilCensusService.create = async (uploadFile, submissionResult) => {
  const csvName = uploadFile.filename && uploadFile.filename.replace(/\.[^/.]+$/, '')
  const jobStatusCode = submissionResult.errorOutput ? 'CWR' : 'COM'
  const jobType = await jobTypeDataService.sqlFindOneByTypeCode('CEN')
  const jobStatus = await jobStatusDataService.sqlFindOneByTypeCode(jobStatusCode)
  const pupilCensusRecord = {
    jobInput: csvName,
    jobType_id: jobType.id,
    jobStatus_id: jobStatus.id,
    jobOutput: submissionResult.output,
    errorOutput: submissionResult.errorOutput
  }
  await jobDataService.sqlCreate(pupilCensusRecord)
}

/**
 * Gets existing pupil census file
 * @return {Object}
 */
pupilCensusService.getUploadedFile = async () => {
  const jobType = await jobTypeDataService.sqlFindOneByTypeCode('CEN')
  const pupilCensus = await jobDataService.sqlFindLatestByTypeId(jobType.id)
  if (!pupilCensus) return
  const jobStatusId = pupilCensus.jobStatus_id
  if (!jobStatusId) {
    throw new Error('Pupil census record does not have a job status reference')
  }
  const jobStatus = await jobStatusDataService.sqlFindOneById(jobStatusId)
  pupilCensus.jobStatus = jobStatus && jobStatus.description
  pupilCensus.csvName = pupilCensus.jobInput
  return pupilCensus
}

module.exports = pupilCensusService
