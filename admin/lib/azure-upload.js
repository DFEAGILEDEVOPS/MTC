'use strict'

const path = require('path')
const azure = require('azure-storage')
const moment = require('moment')
const blobService = azure.createBlobService()
const winston = require('winston')

// Files get uploaded to this container.  dns naming conventions.
const container = 'check-development-app-upload-files'

module.exports = function (req, res, next) {
  // We only want to handle requests files uploads
  if (Object.keys(req.files).length === 0 && req.files.constructor === Object) {
    // empty object: {}
    return next()
  }

  blobService.createContainerIfNotExists(container, function (error, result, response) {
    if (error) {
      winston.error('Failed to create container for upload files')
      winston.error(error)
      return next()
    }

    // Container exists and is private
    Object.getOwnPropertyNames(req.files).forEach(field => {
      // TODO: add _userid to the filename
      const fileObj = req.files[field]
      const remoteFilename = moment().format('YYYYMMDDHHmmss') + '-' + fileObj.field
      const localFilename = path.join(__dirname, '/../', fileObj.file)
      blobService.createBlockBlobFromLocalFile(container, remoteFilename, localFilename, function (error) {
        if (error) {
          winston.error('Failed to upload file to azure')
          winston.error(error)
        } else {
          winston.info(`Uploaded ${remoteFilename} to Azure Blob Storage`)
        }
      })
    })
    next()
  })
}
