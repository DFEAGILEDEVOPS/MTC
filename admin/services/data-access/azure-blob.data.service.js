'use strict'

const { BlobServiceClient } = require('@azure/storage-blob')
const config = require('../../config')

// TODO cache the client once loaded, or is it better to recreate each time?

const blobService = {
  createContainerIfNotExists: async function createContainerIfNotExists (containerName) {
    const client = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
    const containerClient = client.getContainerClient(containerName)
    return containerClient.createIfNotExists()
  },

  uploadLocalFile: async function uploadLocalFile (containerName, remoteFilename, localFilename) {
    const client = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
    const containerClient = client.getContainerClient(containerName)
    const blobClient = containerClient.getBlockBlobClient(remoteFilename)
    return blobClient.uploadFile(localFilename)
  },

  getBlobProperties: async function getBlobProperties (containerName, blobName) {
    const client = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
    const containerClient = client.getContainerClient(containerName)
    const blobClient = containerClient.getBlockBlobClient(blobName)
    return blobClient.getProperties()
  },

  downloadBlob: async function downloadBlob (containerName, blob) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
    const containerClient = blobServiceClient.getContainerClient(containerName)
    const blobClient = containerClient.getBlobClient(blob)
    return blobClient.download()
  }
}

module.exports = blobService
