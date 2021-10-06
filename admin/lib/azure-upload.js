'use strict'

const path = require('path')
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

  await blobService.createContainerIfNotExists(container)

  // Container exists and is private
  Object.getOwnPropertyNames(req.files).forEach(field => {
    // TODO: add _userid to the filename
    const files = req.files[field]
    // If only 1 file is being upload created an array with a single file object
    const submittedFilesObj = Array.isArray(files) ? files : [files]
    submittedFilesObj.map(async (fileObj) => {
      const remoteFilename = moment().format('YYYYMMDDHHmmss') + '-' + fileObj.field + '-' + fileObj.uuid
      const localFilename = path.join(__dirname, '/../', fileObj.file)
      await blobService.uploadLocalFile(container, remoteFilename, localFilename)
    })
    next()
  })
}
