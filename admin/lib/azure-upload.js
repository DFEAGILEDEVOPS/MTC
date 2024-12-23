'use strict'

const moment = require('moment')
const blobService = require('../services/data-access/azure-blob.data.service')

// Files get uploaded to this container.  dns naming conventions.
const container = 'admin-app-uploaded-files'

module.exports = async function (req, res, next) {
  // We only want to handle requests files uploads
  if (Object.keys(req.files).length === 0 && req.files.constructor === Object) {
    // empty object: {}
    return next()
  }

  try {
    await blobService.createContainerIfNotExists(container)
  } catch (error) {
    console.error(`Failed to create container ${container}: ${error.message}`)
  }

  // Container exists and is private
  const files = Object.getOwnPropertyNames(req.files)
  for (const field of files) {
    const files = req.files[field]
    // If only 1 file is being upload created an array with a single file object
    const submittedFilesObj = Array.isArray(files) ? files : [files]
    for (const fileObj of submittedFilesObj) {
      // Create a safe derivative of the user name for use in the filename
      const userId = req.user?.UserName?.replace(/[^A-Za-z0-9]/, '')
      const remoteFilename = moment().format('YYYYMMDDHHmmss') + '-' + userId + '-' + fileObj.field + '-' + fileObj.uuid
      const localFilename = fileObj.file
      try {
        await blobService.uploadLocalFile(container, remoteFilename, localFilename)
      } catch {
        console.error(`ERROR: Failed to upload file ${fileObj.filename} to ${container}`)
      }
    }
  }
  next()
}
