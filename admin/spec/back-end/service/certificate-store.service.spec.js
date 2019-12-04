'use strict'

/* global describe, it, spyOn, beforeEach, expect, xit */

let certStoreService
let config
let azureBlobDataService

describe('certificate store', () => {
  beforeEach(() => {
    // delete require.cache[require.resolve('../../../services/data-access/azure-blob.data.service')]
    certStoreService = require('../../../services/certificate-store.service')
    config = require('../../../config')
    azureBlobDataService = require('../../../services/data-access/azure-blob.data.service')
    azureBlobDataService.getBlobToTextAsync = () => {}
  })
  describe('getTsoPublicKey', () => {
    it('attempts to retrieve certificate from azure if configured', async () => {
      config.Certificates.Azure.BlobContainer = 'theContainerName'
      const certStoreReturnValue = 'the public key in PEM format'
      spyOn(azureBlobDataService, 'getBlobToTextAsync')
        .and.returnValue(certStoreReturnValue)
      const tsoPublicKey = await certStoreService.getNcaPublicKey()
      expect(azureBlobDataService.getBlobToTextAsync).toHaveBeenCalledWith(config.Certificates.Azure.BlobContainer, config.Certificates.Azure.NcaToolsPublicKeyName)
      expect(tsoPublicKey).toBe(certStoreReturnValue)
    })

    it('attempts to read certificate from env var if azure container not configured', async () => {
      config.Certificates.BlobContainer = undefined
      const envVarReturnValue = 'the public key in PEM format'
      config.Certificates.Local.NcaToolsPublicKey = envVarReturnValue
      spyOn(azureBlobDataService, 'getBlobToTextAsync')
      const tsoPublicKey = await certStoreService.getNcaPublicKey()
      expect(azureBlobDataService.getBlobToTextAsync).not.toHaveBeenCalled()
      expect(tsoPublicKey).toBe(envVarReturnValue)
    })

    xit('returns globally cached value after 1st retrieval', async () => {
      // azureBlobDataService = require('../../../services/data-access/azure-blob.data.service')
      config.Certificates.Azure.BlobContainer = 'theContainerName'
      const certStoreReturnValue = 'the public key in PEM format'
      spyOn(azureBlobDataService, 'getBlobToTextAsync').and.returnValue(certStoreReturnValue)
      const tsoPublicKey = await certStoreService.getNcaPublicKey()
      await certStoreService.getNcaPublicKey()
      expect(azureBlobDataService.getBlobToTextAsync).toHaveBeenCalledTimes(1)
      expect(tsoPublicKey).toBe(certStoreReturnValue)
    })
  })

  describe('getMtcPrivateKey', () => {
    it('attempts to retrieve certificate from azure if configured', async () => {
      config.Certificates.Azure.BlobContainer = 'theContainerName'
      const certStoreReturnValue = 'the private key in PEM format'
      spyOn(azureBlobDataService, 'getBlobToTextAsync').and.returnValue(certStoreReturnValue)
      const mtcPrivateKey = await certStoreService.getMtcPrivateKey()
      expect(azureBlobDataService.getBlobToTextAsync).toHaveBeenCalledWith(config.Certificates.Azure.BlobContainer, config.Certificates.Azure.MtcPrivateKey)
      expect(mtcPrivateKey).toBe(certStoreReturnValue)
    })

    it('attempts to read certificate from env var if azure container not configured', async () => {
      config.Certificates.BlobContainer = undefined
      const envVarReturnValue = 'the private key in PEM format'
      config.Certificates.Local.MtcPrivateKey = envVarReturnValue
      spyOn(azureBlobDataService, 'getBlobToTextAsync')
      const mtcPrivateKey = await certStoreService.getMtcPrivateKey()
      expect(azureBlobDataService.getBlobToTextAsync).not.toHaveBeenCalled()
      expect(mtcPrivateKey).toBe(envVarReturnValue)
    })

    xit('returns globally cached value after 1st retrieval', async () => {
      config.Certificates.Azure.BlobContainer = 'theContainerName'
      const certStoreReturnValue = 'the private key in PEM format'
      spyOn(azureBlobDataService, 'getBlobToTextAsync')
        .and.returnValue(certStoreReturnValue)
      const mtcPrivateKey = await certStoreService.getMtcPrivateKey()
      await certStoreService.getMtcPrivateKey()
      expect(azureBlobDataService.getBlobToTextAsync).toHaveBeenCalledTimes(1)
      expect(mtcPrivateKey).toBe(certStoreReturnValue)
    })
  })
})
