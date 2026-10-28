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

    const jobSlug = '2191e1f9-287a-49d9-835d-2aa8c336b5f7'

    beforeEach(() => {
      jest.spyOn(azureBlobDataService, 'createContainerIfNotExists').mockImplementation()
      jest.spyOn(azureBlobDataService, 'uploadLocalFile').mockImplementation()
      jest.spyOn(organisationBulkUploadDataService, 'createJobRecord').mockResolvedValue(jobSlug)
    })

    test('it creates the azure container if it does not exist', async () => {
      await sut.upload(testFile)
      expect(azureBlobDataService.createContainerIfNotExists).toHaveBeenCalled()
    })

    test('it creates a job record to allow the user to track the long-running process', async () => {
      await sut.upload(testFile)
      expect(organisationBulkUploadDataService.createJobRecord).toHaveBeenCalled()
    })

    test('it uploads the file to Azure', async () => {
      await sut.upload(testFile)
      expect(azureBlobDataService.uploadLocalFile).toHaveBeenCalled()
    })

    test('it returns the newly created job record uuid identifier', async () => {
      const res = await sut.upload(testFile)
      expect(res).toBe(jobSlug)
    })

    test('it sets the remote filename to the job slug', async () => {
      await sut.upload(testFile)
      const expectedFilename = `${jobSlug}.csv`
      expect(azureBlobDataService.uploadLocalFile).toHaveBeenCalledWith('school-import', expectedFilename, testFile.file)
    })
  })

  describe('getUploadStatus', () => {
    beforeEach(() => {
      jest.spyOn(organisationBulkUploadDataService, 'sqlGetJobData').mockResolvedValue({
        jobStatusDescription: 'Submitted',
        jobStatusCode: 'SUB',
        errorOutput: 'test error',
        jobOutput: 'a message'
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
      expect(status.jobOutput).toBe('a message')
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
      const expectedErrorText = 'an error line\nanother error line'
      const expectedOutputText = 'a standard line\nanother standard line'
      jest.spyOn(sut, 'getUploadStatus').mockResolvedValue({
        errorOutput: expectedErrorText,
        jobOutput: expectedOutputText
      })
      const zipBuf = await sut.getZipResults(jobSlug)

      // Deflate test
      const zip = new AdmZip(zipBuf)
      const entries = zip.getEntries()
      let i = 0
      entries.forEach((entry) => {
        if (entry.entryName === 'error.txt') {
          // Unzip an entry to memory
          expect(zip.readAsText(entry)).toBe(expectedErrorText)
          i += 1
        }
        if (entry.entryName === 'output.txt') {
          expect(zip.readAsText(entry)).toBe(expectedOutputText)
          i += 1
        }
      })
      expect(i).toBe(2)
    })
  })
})
