const fs = require('fs-extra')
const R = require('ramda')
const azureBlobDataService = require('./data-access/azure-blob.data.service')

const uploadedFileService = {}

/**
 * Get uploaded file size in KB.
 * @param {String} file
 * @return {Number} size
 */
uploadedFileService.getFilesize = (file) => {
  const stats = fs.statSync(file)
  return Math.round(R.divide(stats.size, 1024) * 100) / 100
}

/**
 * Get azure blob file size in KB.
 * @param {String} blob
 * @return {Promise<Number>} size
 */
uploadedFileService.getAzureBlobFileSize = async (blob) => {
  if (!blob) {
    return
  }
  const blobFile = await azureBlobDataService.getBlobProperties('csvuploads', blob)
  if (!blobFile || !blobFile._response.parsedHeaders.contentLength) {
    throw new Error('Blob file not found or invalid file')
  }
  const contentLength = blobFile._response.parsedHeaders.contentLength
  // @ts-ignore need to create definition for promisified object
  return Math.round(R.divide(contentLength, 1024) * 100) / 100
}

module.exports = uploadedFileService
