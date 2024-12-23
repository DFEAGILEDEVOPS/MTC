'use strict'

const { BlobServiceClient } = require('@azure/storage-blob')
const uuid = require('uuid')
const sut = require('../services/data-access/azure-blob.data.service')
const fs = require('fs')
const path = require('path')
const config = require('../config')

const connectionString = config.AZURE_STORAGE_CONNECTION_STRING
const commonPrefix = 'mtc-integration-test'
const fixturesFolder = path.join('./', 'tests-integration', 'fixtures')

function getUniqueName () {
  return `${commonPrefix}-${uuid.v4()}`
}

let testRunContainerName
let testRunDirectoryName

describe('azure-blob.data.service', () => {
  beforeAll(async () => {
    testRunContainerName = getUniqueName()
    testRunDirectoryName = path.join(fixturesFolder, getUniqueName())
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
    const containerClient = blobServiceClient.getContainerClient(testRunContainerName)
    await containerClient.create()
    await fs.promises.mkdir(testRunDirectoryName)
  })

  afterAll(async () => {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
    const containerClient = blobServiceClient.getContainerClient(testRunContainerName)
    await containerClient.deleteIfExists()
    await fs.promises.rmdir(testRunDirectoryName, {
      recursive: true
    })
  })

  test('createContainerIfNotExists - should create container if it does not already exist', async () => {
    const containerName = getUniqueName()
    await sut.createContainerIfNotExists(containerName)
    const serviceClient = BlobServiceClient.fromConnectionString(connectionString)
    const containerClient = serviceClient.getContainerClient(containerName)
    expect(await containerClient.exists()).toBe(true)
    await containerClient.delete()
  })

  test('uploadLocalFile - should create local file in specified container', async () => {
    const content = uuid.v4()
    const localFileName = path.join(testRunDirectoryName, `${commonPrefix}-local-${content}.txt`)
    await fs.promises.writeFile(localFileName, content)
    const remoteFileName = `${commonPrefix}-upload-${content}.txt`
    await sut.uploadLocalFile(testRunContainerName, remoteFileName, localFileName)
    const serviceClient = BlobServiceClient.fromConnectionString(connectionString)
    const containerClient = serviceClient.getContainerClient(testRunContainerName)
    const blobClient = containerClient.getBlockBlobClient(remoteFileName)
    const downloadedFileName = path.join(testRunDirectoryName, `${commonPrefix}-download-${content}.txt`)
    await blobClient.downloadToFile(downloadedFileName)
    expect(fs.existsSync(downloadedFileName)).toBe(true)
    const downloadedFileContent = fs.readFileSync(downloadedFileName)
    expect(downloadedFileContent.toString()).toEqual(content)
  })

  test('getBlobProperties - fetches blob properties from storage', async () => {
    const content = uuid.v4()
    const localFileName = path.join(testRunDirectoryName, `${commonPrefix}-local-${content}.txt`)
    await fs.promises.writeFile(localFileName, content)
    const remoteBlobName = `${commonPrefix}-upload-${content}.txt`
    await sut.uploadLocalFile(testRunContainerName, remoteBlobName, localFileName)
    try {
      const props = await sut.getBlobProperties(testRunContainerName, remoteBlobName)
      expect(props).toBeDefined()
      expect(props._response.status).toEqual(200)
    } catch (error) {
      fail(`could not fetch properties: ${error}. container:${testRunContainerName}. file:${remoteBlobName}`)
      console.dir(error)
    }
  })

  test('downloadBlob - fetches existing blob from container', async () => {
    const content = uuid.v4()
    const localFileName = path.join(testRunDirectoryName, `${commonPrefix}-local-${content}.txt`)
    await fs.promises.writeFile(localFileName, content)
    const remoteBlobName = `${commonPrefix}-upload-${content}.txt`
    const serviceClient = BlobServiceClient.fromConnectionString(connectionString)
    const containerClient = serviceClient.getContainerClient(testRunContainerName)
    const blobClient = containerClient.getBlockBlobClient(remoteBlobName)
    await blobClient.uploadFile(localFileName)
    const buffer = await sut.getBlobDataAsBuffer(testRunContainerName, remoteBlobName)
    expect(buffer).toBeDefined()
    try {
      const parsed = Buffer.from(buffer)
      expect(parsed).toBeDefined()
    } catch (error) {
      fail(`unable to parse response to buffer:${error.message}`)
    }
  })
})
