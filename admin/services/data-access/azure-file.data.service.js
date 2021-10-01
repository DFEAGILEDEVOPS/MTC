const { BlobServiceClient } = require('@azure/storage-blob')
const config = require('../../config')

let blobServiceClient

function getClient () {
  if (blobServiceClient === undefined) {
    blobServiceClient = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
  }
  return blobServiceClient
}

const azureUploadFile = async (containerName, remoteFilename, text, streamLength) => {
  const blobServiceClient = getClient()
  const containerClient = blobServiceClient.getContainerClient(containerName)
  await containerClient.createIfNotExists()
  const blobClient = containerClient.getBlockBlobClient(remoteFilename)
  return blobClient.upload(text, streamLength)
}

const azureDownloadFile = async (containerName, blob) => {
  const blobServiceClient = getClient()
  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blobClient = containerClient.getBlobClient(blob)
  return blobClient.download()
}

// TODO this is now returns in .readableStreamBody not into the method argument
const azureDownloadFileStream = async (containerName, blobName) => {
  const blobServiceClient = getClient()
  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blobClient = containerClient.getBlockBlobClient(blobName)
  return blobClient.download()
}

const service = config.AZURE_STORAGE_CONNECTION_STRING
  ? {
      azureUploadFile,
      azureDownloadFile,
      azureDownloadFileStream
    }
  : {
      azureUploadFile: () => {
        return { name: 'test_error.csv' }
      },
      azureDownloadFile: () => 'text',
      azureDownloadFileStream: (container, blob, fStream) => {
        fStream.write('binary')
        fStream.end()
      }
    }

module.exports = service
