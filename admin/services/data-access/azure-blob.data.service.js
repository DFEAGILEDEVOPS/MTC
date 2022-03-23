'use strict'

const { BlobServiceClient } = require('@azure/storage-blob')
const config = require('../../config')

const blobService = {
  /**
   * creates a blob container if it does not already exist
   * @param {string} containerName
   * @returns {Promise<import('@azure/storage-blob').ContainerCreateIfNotExistsResponse>}
   */
  createContainerIfNotExists: async function createContainerIfNotExists (containerName) {
    const client = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
    const containerClient = client.getContainerClient(containerName)
    return containerClient.createIfNotExists()
  },

  /**
   * uploads a local file to blob storage
   * @param {string} containerName
   * @param {string} remoteFilename
   * @param {*} localFilename the local file including relative path
   * @returns {Promise<import('@azure/storage-blob').BlobUploadCommonResponse>}
   */
  uploadLocalFile: async function uploadLocalFile (containerName, remoteFilename, localFilename) {
    const client = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
    const containerClient = client.getContainerClient(containerName)
    const blobClient = containerClient.getBlockBlobClient(remoteFilename)
    return blobClient.uploadFile(localFilename)
  },

  /**
   * uploads buffer to blob storage
   * @param {string} containerName
   * @param {string} remoteFilename
   * @param {Buffer} data the local file including relative path
   * @returns {Promise<import('@azure/storage-blob').BlobUploadCommonResponse>}
   */
  uploadData: async function uploadData (containerName, remoteFilename, data) {
    const client = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
    const containerClient = client.getContainerClient(containerName)
    await containerClient.createIfNotExists()
    const blobClient = containerClient.getBlockBlobClient(remoteFilename)
    return blobClient.uploadData(data)
  },

  /**
   * get the properties of a blob entry
   * @param {string} containerName
   * @param {string} blobName
   * @returns {Promise<import('@azure/storage-blob').BlobGetPropertiesResponse>}
   */
  getBlobProperties: async function getBlobProperties (containerName, blobName) {
    const client = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
    const containerClient = client.getContainerClient(containerName)
    const blobClient = containerClient.getBlockBlobClient(blobName)
    return blobClient.getProperties()
  },

  /**
   * retrieve blob data as a buffer object
   * @param {string} containerName
   * @param {*} blobName
   * @returns {Promise<Buffer>}
   */
  getBlobDataAsBuffer: async function downloadBlob (containerName, blobName) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
    const containerClient = blobServiceClient.getContainerClient(containerName)
    const blobClient = containerClient.getBlockBlobClient(blobName)
    return blobClient.downloadToBuffer()
  }
}

module.exports = blobService
