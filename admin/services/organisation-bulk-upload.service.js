const azureBlobDataService = require('./data-access/azure-blob.data.service')
const fileValidator = require('../lib/validator/file-validator.js')
const organisationBulkUploadDataService = require('./data-access/organisation-bulk-upload.data.service')
const AdmZip = require('adm-zip')

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
    await azureBlobDataService.createContainerIfNotExists(container)

    // Create the job record first as it acts as a singleton - we only want one file upload at a time.  If we can't
    // create the job record, then we abort.
    const jobSlug = await organisationBulkUploadDataService.createJobRecord()
    const remoteFilename = `${jobSlug}.csv`
    await azureBlobDataService.uploadLocalFile(container, remoteFilename, uploadFile.file)
    return jobSlug
  },

  /**
   * Get the status of the file upload
   * @param jobSlug uuid
   * @returns {Promise<{urlSlug: (string|*), code: (string|*), description: (string|*), errorOutput: (string|*), jobOutput: any}>}
   */
  getUploadStatus: async function getUploadStatus (jobSlug) {
    const jobData = await organisationBulkUploadDataService.sqlGetJobData(jobSlug)
    if (jobData === undefined) {
      throw new Error('Job ID not found')
    }
    return {
      description: jobData.jobStatusDescription,
      code: jobData.jobStatusCode,
      errorOutput: jobData.errorOutput,
      jobOutput: JSON.parse(jobData.jobOutput),
      urlSlug: jobData.urlSlug
    }
  },

  /**
   * Return a buffer containing the Zipped data (error.txt, output.txt) for the service-manager to download.
   * @param jobSlug
   * @returns {Promise<Buffer>}
   */
  getZipResults: async function getZipResults (jobSlug) {
    if (jobSlug === undefined) {
      throw new Error('Missing job ID')
    }
    const jobData = await this.getUploadStatus(jobSlug)
    const zip = new AdmZip()
    // noinspection JSCheckFunctionSignatures - 3rd and 4th args are optional
    zip.addFile('error.txt', jobData.jobOutput.stderr.join('\n'))
    // noinspection JSCheckFunctionSignatures - 3rd and 4th args are optional
    zip.addFile('output.txt', jobData.jobOutput.stdout.join('\n'))
    return zip.toBuffer()
  }
}

module.exports = organisationBulkUploadService
