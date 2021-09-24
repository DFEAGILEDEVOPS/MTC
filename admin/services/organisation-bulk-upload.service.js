const azureBlobDataService = require('./data-access/azure-blob.data.service')
const fileValidator = require('../lib/validator/file-validator.js')
// Files get uploaded to this container.  dns naming conventions.
const container = 'school-import'

const organisationBulkUploadService = {
  /**
   * Validate an upload file for basic errors
   * @param uploadFile
   * @returns {Promise<*>}
   */
  validate: function validate (uploadFile) {
    return fileValidator.validate(uploadFile, 'fileOrganisations')
  },
  /**
   *
   * @param {{ file: string, filename: string }} uploadFile
   * @returns {Promise<void>}
   */
  upload: async function upload (uploadFile) {
    console.log('Upload file is ', uploadFile)
    const remoteFilename = uploadFile.filename
    console.log('container', container)
    console.log('remote fname', remoteFilename)
    console.log('localFile', uploadFile.file)
    await azureBlobDataService.createContainerIfNotExistsAsync(container)
    await azureBlobDataService.createBlockBlobFromLocalFileAsync(container, remoteFilename, uploadFile.file)
  }
}

module.exports = organisationBulkUploadService
