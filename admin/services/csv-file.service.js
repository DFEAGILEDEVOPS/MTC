'use strict'

const blobDataService = require('./data-access/azure-blob.data.service')

const csvBlobContainerName = 'csvuploads'

const service = {
  /**
   * obtains a csv file asynchronously from blob storage as a buffer
   * @param {*} remoteFileName
   * @returns {Promise<Buffer>}
   */
  getCsvFileAsBuffer: function getCsvFileAsBuffer (remoteFileName) {
    return blobDataService.getBlobDataAsBuffer(csvBlobContainerName, remoteFileName)
  }
}

module.exports = service
