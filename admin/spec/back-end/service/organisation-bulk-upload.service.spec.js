/* global describe, jest, test, expect, beforeEach, afterEach */
const uuid = require('uuid')

const sut = require('../../../services/organisation-bulk-upload.service')
const fileValidator = require('../../../lib/validator/file-validator')
const azureBlobDataService = require('../../../services/data-access/azure-blob.data.service')
const organisationBulkUploadDataService = require('../../../services/data-access/organisation-bulk-upload.data.service')
const AdmZip = require('adm-zip')

describe('organisationBulkUploadService', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('validate', () => {
    test('it calls fileValidator.validate', async () => {
      jest.spyOn(fileValidator, 'validate').mockImplementation()
      await sut.validate({})
      expect(fileValidator.validate).toHaveBeenCalled()
    })
  })

  describe('upload', () => {
    const testFile = {
      file: 'foo.csv',
      filename: '/test/foo.csv'
    }

    beforeEach(() => {
      jest.spyOn(azureBlobDataService, 'createContainerIfNotExistsAsync').mockImplementation()
      jest.spyOn(azureBlobDataService, 'createBlockBlobFromLocalFileAsync').mockImplementation()
      jest.spyOn(organisationBulkUploadDataService, 'createJobRecord').mockImplementation()
    })

    test('it creates the azure container if it does not exist', async () => {
      await sut.upload(testFile)
      expect(azureBlobDataService.createContainerIfNotExistsAsync).toHaveBeenCalled()
    })

    test('it creates a job record to allow the user to track the long-running process', async () => {
      await sut.upload(testFile)
      expect(organisationBulkUploadDataService.createJobRecord).toHaveBeenCalled()
    })

    test('it uploads the file to Azure', async () => {
      await sut.upload(testFile)
      expect(azureBlobDataService.createBlockBlobFromLocalFileAsync).toHaveBeenCalled()
    })

    test('it returns the newly created job record uuid identifier', async () => {
      const ident = uuid.NIL
      jest.spyOn(organisationBulkUploadDataService, 'createJobRecord').mockResolvedValue(ident)
      const res = await sut.upload(testFile)
      expect(res).toBe(ident)
    })
  })

  describe('getUploadStatus', () => {
    beforeEach(() => {
      jest.spyOn(organisationBulkUploadDataService, 'sqlGetJobData').mockResolvedValue({
        jobStatusDescription: 'Submitted',
        jobStatusCode: 'SUB',
        errorOutput: 'test error',
        jobOutput: JSON.stringify({
          stderr: 'error line',
          stdout: 'a message'
        })
      })
    })

    test('it calls the data service to get the job status', async () => {
      const ident = uuid.NIL
      await sut.getUploadStatus(ident)
      expect(organisationBulkUploadDataService.sqlGetJobData).toHaveBeenCalledWith(ident)
    })

    test('it throws if no job data is found for the slug', async () => {
      const ident = uuid.NIL
      jest.spyOn(organisationBulkUploadDataService, 'sqlGetJobData').mockResolvedValue(undefined)
      await expect(sut.getUploadStatus(ident)).rejects.toThrow(/job id not found/i)
    })

    test('it returns an object', async () => {
      const ident = uuid.NIL
      const status = await sut.getUploadStatus(ident)
      expect(status.description).toBe('Submitted')
      expect(status.code).toBe('SUB')
      expect(status.errorOutput).toBe('test error')
      expect(status.jobOutput.stderr).toBe('error line')
      expect(status.jobOutput.stdout).toBe('a message')
    })
  })

  describe('getZipResults', () => {
    beforeEach(() => {

    })

    test('if the job slug is not provided it throws', async () => {
      await expect(sut.getZipResults(undefined)).rejects.toThrow(/missing job id/i)
    })

    test('it zips up the files', async () => {
      const jobSlug = uuid.NIL
      jest.spyOn(sut, 'getUploadStatus').mockResolvedValue({
        jobOutput: {
          stderr: ['an error line\nanother error line'],
          stdout: ['a standard line\nanother standard line']
        }
      })
      const zipBuf = await sut.getZipResults(jobSlug)

      // Deflate test
      const zip = new AdmZip(zipBuf)
      const entries = zip.getEntries()
      let i = 0
      entries.forEach((entry) => {
        if (entry.entryName === 'error.txt') {
          // Unzip an entry to memory
          expect(zip.readAsText(entry)).toBe('an error line\nanother error line')
          i += 1
        }
        if (entry.entryName === 'output.txt') {
          expect(zip.readAsText(entry)).toBe('a standard line\nanother standard line')
          i += 1
        }
      })
      expect(i).toBe(2)
    })
  })
})
