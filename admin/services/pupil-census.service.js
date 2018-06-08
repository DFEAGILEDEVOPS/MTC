'use strict'
const csv = require('fast-csv')
const fs = require('fs-extra')

const jobDataService = require('./data-access/job.data.service')
const jobStatusDataService = require('./data-access/job-status.data.service')
const jobTypeDataService = require('./data-access/job-type.data.service')
const pupilCensusDataService = require('./data-access/pupil-census.data.service')
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
  // Create the pupil census record
  const job = await pupilCensusService.create(uploadFile)
  if (!job || !job.insertId) {
    throw new Error('Job has not been created')
  }
  // Process and perform pupil bulk insertion
  const submissionResult = await pupilCensusProcessingService.process(csvData, job.insertId)
  if (!submissionResult) {
    throw new Error('No result has been returned from pupil bulk insertion')
  }
  // Update pupil census record with corresponding output
  pupilCensusService.updateJobOutput(job.insertId, submissionResult)
}

/**
 * Creates a new pupilCensus record
 * @param {Object} uploadFile
 * @return {Promise}
 */
pupilCensusService.create = async (uploadFile) => {
  const csvName = uploadFile.filename && uploadFile.filename.replace(/\.[^/.]+$/, '')
  const jobType = await jobTypeDataService.sqlFindOneByTypeCode('CEN')
  const jobStatus = await jobStatusDataService.sqlFindOneByTypeCode('SUB')
  const pupilCensusRecord = {
    jobInput: csvName,
    jobType_id: jobType.id,
    jobStatus_id: jobStatus.id
  }
  return jobDataService.sqlCreate(pupilCensusRecord)
}

/**
 * Updates the output of a pupilCensus record
 * @param {Number} jobId
 * @param {Object} submissionResult
 * @returns {Promise.<void>}
 */
pupilCensusService.updateJobOutput = async (jobId, submissionResult) => {
  const jobStatusCode = submissionResult.errorOutput ? 'CWR' : 'COM'
  const jobStatus = await jobStatusDataService.sqlFindOneByTypeCode(jobStatusCode)
  const output = submissionResult.output
  const errorOutput = submissionResult.errorOutput
  await jobDataService.sqlUpdate(jobId, jobStatus.id, output, errorOutput)
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
  if (!jobStatus) {
    throw new Error(`There is no job status for job status id ${jobStatusId}`)
  }
  const completedWithErrors = 'CWR'
  const deleted = 'DEL'
  let outcome
  if (jobStatus.jobStatusCode === completedWithErrors) {
    outcome = pupilCensus.errorOutput
  }
  if (jobStatus.jobStatusCode === deleted) {
    outcome = jobStatus.description
  } else {
    outcome = `${jobStatus.description} : ${pupilCensus.jobOutput}`
  }
  pupilCensus.csvName = pupilCensus.jobInput
  pupilCensus.outcome = outcome
  pupilCensus.jobStatusCode = jobStatus.jobStatusCode
  return pupilCensus
}

/**
 * Remove a pupil census file record
 * @param {Number} pupilCensusId
 * @return {Object}
 */
pupilCensusService.remove = async (pupilCensusId) => {
  if (!pupilCensusId) {
    throw new Error('No pupil census id is provided for deletion')
  }
  await pupilCensusDataService.sqlDeletePupilsByJobId(pupilCensusId)
  const jobStatus = await jobStatusDataService.sqlFindOneByTypeCode('DEL')
  const output = jobStatus.description
  await jobDataService.sqlUpdate(pupilCensusId, jobStatus.id, output)
}

module.exports = pupilCensusService
