'use strict'
const azureBlobDataService = require('./data-access/azure-blob.data.service')
const fileValidator = require('../lib/validator/file-validator.js')
const jobDataService = require('./data-access/job.data.service')
const jobStatusDataService = require('./data-access/job-status.data.service')
const jobTypeDataService = require('./data-access/job-type.data.service')
const pupilCensusDataService = require('./data-access/pupil-census.data.service')

const pupilCensusService = {}

/**
 * Checks pupil census file for errors
 * @param {Object} uploadFile
 * @return {Promise<Object>} validation error
 */
pupilCensusService.process = async (uploadFile) => {
  return fileValidator.validate(uploadFile, 'file-upload')
}

/**
 * Upload handler for pupil census to azure blob storage
 * Reads the file contents and creates of the pupil census record
 * @param uploadFile
 * @return {Promise<void>}
 */
pupilCensusService.upload2 = async (uploadFile) => {
  const job = await pupilCensusService.createJobRecord(uploadFile)
  if (!job || !job.id || !job.urlSlug) {
    throw new Error('Job has not been created')
  }
  try {
    await azureBlobDataService.createContainerIfNotExistsAsync('census')
    await azureBlobDataService.createBlockBlobFromLocalFileAsync('census', job.urlSlug, uploadFile.file)
  } catch (error) {
    await jobDataService.sqlUpdateStatus(job.urlSlug, 'FLD')
    throw error
  }
}

/**
 * Creates a new pupilCensus record
 * @param {Object} uploadFile
 * @return {Promise}
 */
pupilCensusService.createJobRecord = async (uploadFile) => {
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
 * @return {Promise<Object>}
 */
pupilCensusService.getUploadedFile = async () => {
  const jobType = await jobTypeDataService.sqlFindOneByTypeCode('CEN')
  const pupilCensus = await jobDataService.sqlFindLatestByTypeId(jobType.id)
  if (!pupilCensus) return
  if (!pupilCensus.jobStatusDescription || !pupilCensus.jobStatusCode) {
    throw new Error('Pupil census record does not have a job status reference')
  }
  const outcome = `${pupilCensus.jobStatusDescription} ${pupilCensus.jobOutput ? pupilCensus.jobOutput : ''}`
  pupilCensus.csvName = pupilCensus.jobInput
  pupilCensus.outcome = outcome
  pupilCensus.dbErrorText = pupilCensus.errorOutput && pupilCensus.errorOutput.replace(/\n/g, '<br><br>')
  return pupilCensus
}

/**
 * Remove a pupil census file record
 * @param {Number} pupilCensusId
 * @return {Promise<Object>}
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
