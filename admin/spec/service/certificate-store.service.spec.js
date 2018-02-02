'use strict'

/* global describe, it, spyOn, beforeEach, fail, expect */

let certStoreService
let config
let azureFileDataService

describe('certificate store', () => {
  beforeEach(() => {
    Object.keys(require.cache).forEach((key) => {
      delete require.cache[key]
    })
    certStoreService = require('../../services/certificate-store.service')
    config = require('../../config')
    azureFileDataService = require('../../services/data-access/azure-file.data.service')
  })
  it('attempts to retrieve certificate from azure if configured', async (done) => {
    config.Certificates.Azure.BlobContainer = 'theContainerName'
    const certStoreReturnValue = 'the public key in PEM format'
    spyOn(azureFileDataService, 'azureDownloadFile')
    .and.returnValue(certStoreReturnValue)
    const tsoPublicKey = await certStoreService.getTsoPublicKey()
    expect(azureFileDataService.azureDownloadFile).toHaveBeenCalledTimes(1)
    expect(tsoPublicKey).toBe(certStoreReturnValue)
    done()
  })

  it('attempts to read certificate from env var if azure container not configured', async (done) => {
    config.Certificates.BlobContainer = undefined
    const envVarReturnValue = 'the public key in PEM format'
    config.Certificates.Local.NcaToolsPublicKey = envVarReturnValue
    spyOn(azureFileDataService, 'azureDownloadFile')
    const tsoPublicKey = await certStoreService.getTsoPublicKey()
    expect(azureFileDataService.azureDownloadFile).not.toHaveBeenCalled()
    expect(tsoPublicKey).toBe(envVarReturnValue)
    done()
  })

  it('returns globally cached value after 1st retrieval', async (done) => {
    config.Certificates.Azure.BlobContainer = 'theContainerName'
    const certStoreReturnValue = 'the public key in PEM format'
    spyOn(azureFileDataService, 'azureDownloadFile')
    .and.returnValue(certStoreReturnValue)
    const tsoPublicKey = await certStoreService.getTsoPublicKey()
    await certStoreService.getTsoPublicKey()
    expect(azureFileDataService.azureDownloadFile).toHaveBeenCalledTimes(1)
    expect(tsoPublicKey).toBe(certStoreReturnValue)
    done()
  })
})
