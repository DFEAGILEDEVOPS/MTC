'use strict'

const { BlobServiceClient } = require('@azure/storage-blob')
const config = require('../../config')

let blobServiceClient

function getClient () {
  if (blobServiceClient === undefined) {
    blobServiceClient = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
  }
  return blobServiceClient
}

const blobService = {
  createContainerIfNotExists: async function createContainerIfNotExists (containerName) {
    const client = getClient()
    const containerClient = client.getContainerClient(containerName)
    return containerClient.createIfNotExists()
  },

  createBlockBlobFromLocalFile: async function createBlockBlobFromLocalFile (containerName, remoteFilename, localFilename) {
    const client = getClient()
    const containerClient = client.getContainerClient(containerName)
    const blobClient = containerClient.getBlockBlobClient(remoteFilename)
    return blobClient.uploadFile(localFilename)
  },

  getBlobProperties: async function getBlobProperties (containerName, blobName) {
    const client = getClient()
    const containerClient = client.getContainerClient(containerName)
    const blobClient = containerClient.getBlockBlobClient(blobName)
    return blobClient.getProperties()
  }
}

module.exports = blobService
