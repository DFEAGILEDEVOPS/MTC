'use strict'
/* global describe, it, expect */

const { BlobServiceClient } = require('@azure/storage-blob')
const uuid = require('uuid')
const sut = require('../services/data-access/azure-blob.data.service')

describe('azure-blob.data.service', () => {
  it('should create container if it does not already exist', async () => {
    const uniqueContainerName = uuid.v4()
    await sut.createContainerIfNotExists(uniqueContainerName)
    const serviceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)
    const containerClient = serviceClient.getContainerClient(uniqueContainerName)
    expect(await containerClient.exists()).toBe(true)
  })
})
