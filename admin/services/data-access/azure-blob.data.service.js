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

  createBlockBlobFromLocalFile: async function createBlockBlobFromLocalFile (containerName, remoteFilename, localFilename) {
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

  azureUploadFile: async function azureUploadFile (containerName, remoteFilename, text, streamLength) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
    const containerClient = blobServiceClient.getContainerClient(containerName)
    await containerClient.createIfNotExists()
    const blobClient = containerClient.getBlockBlobClient(remoteFilename)
    return blobClient.upload(text, streamLength)
  },

  azureDownloadFile: async function azureDownloadFile (containerName, blob) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
    const containerClient = blobServiceClient.getContainerClient(containerName)
    const blobClient = containerClient.getBlobClient(blob)
    return blobClient.download()
  },

  // TODO this now returns in .readableStreamBody not into the method argument
  // TODO probably broken, integration tests required
  azureDownloadFileStream: async function azureDownloadFileStream (containerName, blobName) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
    const containerClient = blobServiceClient.getContainerClient(containerName)
    const blobClient = containerClient.getBlockBlobClient(blobName)
    return blobClient.download()
  }
}

module.exports = blobService
