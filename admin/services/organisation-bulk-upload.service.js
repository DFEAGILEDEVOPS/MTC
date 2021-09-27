const azureBlobDataService = require('./data-access/azure-blob.data.service')
const fileValidator = require('../lib/validator/file-validator.js')
const organisationBulkUploadDataService = require('./data-access/organisation-bulk-upload.data.service')

// Files get uploaded to this container.  dns naming conventions.
const container = 'school-import'

const organisationBulkUploadService = {
  /**
   * Validate an upload file for basic errors
   * @param uploadFile
   * @returns {Promise<*>}
   */
  validate: function validate (uploadFile) {
    return fileValidator.validate(uploadFile, 'file-upload')
  },

  /**
   *
   * @param {{ file: string, filename: string }} uploadFile
   * @returns {Promise<string>} job slug UUID
   */
  upload: async function upload (uploadFile) {
    console.log('Upload file is ', uploadFile)
    const remoteFilename = uploadFile.filename
    console.log('container', container)
    console.log('remote fname', remoteFilename)
    console.log('localFile', uploadFile.file)
    await azureBlobDataService.createContainerIfNotExistsAsync(container)

    // Create the job record first as it acts as a singleton - we only want one file upload at a time.  If we can't
    // create the job record, then we abort.
    const jobSlug = await organisationBulkUploadDataService.createJobRecord()
    await azureBlobDataService.createBlockBlobFromLocalFileAsync(container, remoteFilename, uploadFile.file)
    return jobSlug
  },

  getUploadStatus: async function getUploadStatus (jobSlug) {
    const jobData = await organisationBulkUploadDataService.sqlGetJobData(jobSlug)
    return {
      description: jobData.jobStatusDescription,
      code: jobData.jobStatusCode,
      errorOutput: jobData.errorOutput,
      jobOutput: JSON.parse(jobData.jobOutput)
    }
  }
}

module.exports = organisationBulkUploadService
