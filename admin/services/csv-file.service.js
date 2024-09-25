'use strict'
const blobDataService = require('./data-access/azure-blob.data.service')
const R = require('ramda')

const csvBlobContainerName = 'csvuploads'

const service = {
  /**
   * obtains a csv file asynchronously from blob storage as a buffer
   * @param {*} remoteFileName
   * @returns {Promise<Buffer>}
   */
  getCsvFileAsBuffer: function getCsvFileAsBuffer (remoteFileName) {
    if (R.isNil(remoteFileName)) {
      throw new Error('Missing remoteFilename param')
    }
    return blobDataService.getBlobDataAsBuffer(csvBlobContainerName, remoteFileName)
  }
}

module.exports = service
