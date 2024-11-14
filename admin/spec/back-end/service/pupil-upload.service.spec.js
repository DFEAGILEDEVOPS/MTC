'use strict'

const path = require('path')
const pupilUploadService = require('../../../services/pupil-upload.service')
const schoolMock = require('../mocks/school')
const generateErrorCSVService = require('../../../services/generate-error-csv.service')
const validateCSVService = require('../../../services/pupil-validate-csv.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const redisCacheService = require('../../../services/data-access/redis-cache.service')
const redisKeyService = require('../../../services/redis-key.service')

const dummyCSV = {
  file: path.join(__dirname, '../../../data/fixtures/dummy.csv')
}

const userId = 456

describe('pupil-upload service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  beforeEach(() => {
    redisCacheService.drop = jest.fn()
  })

  describe('upload', () => {
    beforeEach(() => {
      validateCSVService.process = jest.fn(async () => {
        return {
          validationErrors: { errors: '' },
          hasValidationError: true
        }
      })
    })

    test('throws an error if userId is undefined', async () => {
      await expect(pupilUploadService.upload(schoolMock, dummyCSV, undefined)).rejects.toThrow('userId is required')
    })

    test('returns an object after utilizing the promisified csv library', async () => {
      const pr = await pupilUploadService.upload(schoolMock, dummyCSV, userId)
      expect(pr).toBeDefined()
      expect(typeof pr).toBe('object')
      expect(pr.fileErrors.errors).toBe('')
    })
  })

  xdescribe('generates csv validation errors', () => {
    beforeEach(() => {
      jest.spyOn(validateCSVService, 'process').mockResolvedValue({
        csvData: [['test', 'test', 'test', 'test', 'test', 'test', 'Error'],
          ['test', 'test', 'test', 'test', 'test', 'test', 'Error']]
      })
    })

    describe('on csv error', () => {
      beforeEach(() => {
        jest.spyOn(generateErrorCSVService, 'generate').mockResolvedValue({ file: { name: 'test.csv' } })
      })

      test('returns error csv file if csv has errors', async () => {
        const pr = await pupilUploadService.upload(schoolMock, dummyCSV, userId)
        expect(pr.csvErrorFile).toBe('test.csv')
      })
    })

    describe('on csv generation error', () => {
      jest.spyOn(generateErrorCSVService, 'generate').mockResolvedValue({ error: 'error' })
    })

    test('returns error csv file if csv has errors', async () => {
      const pr = await pupilUploadService.upload(schoolMock, dummyCSV, userId)
      expect(pr.error).toBe('error')
    })
  })

  describe('attempts to save csv errors', () => {
    beforeEach(() => {
      jest.spyOn(validateCSVService, 'process').mockResolvedValue({
        csvData: [['test', 'test', 'test', 'test', 'test', 'test'],
          ['test', 'test', 'test', 'test', 'test', 'test']]
      })
      jest.spyOn(generateErrorCSVService, 'generate').mockResolvedValue({ file: { name: 'test.csv' } })
    })

    describe('and returns an object with pupils', () => {
      beforeEach(() => {
        jest.spyOn(pupilDataService, 'sqlInsertMany').mockResolvedValue({ insertId: [1, 2], rowsModified: 4 })
        jest.spyOn(redisCacheService, 'drop').mockImplementation()
        jest.spyOn(redisKeyService, 'getPupilRegisterViewDataKey').mockImplementation()
      })

      test('when saved successfully', async () => {
        const pr = await pupilUploadService.upload(schoolMock, dummyCSV, userId)
        expect(pr.pupilIds.length).toBe(2)
        expect(pr).toEqual({ pupilIds: [1, 2] })
      })
    })

    describe('and returns an object with an error if save fails', () => {
      beforeEach(() => {
        jest.spyOn(pupilDataService, 'sqlInsertMany').mockResolvedValue(null)
        jest.spyOn(redisCacheService, 'drop').mockImplementation()
        jest.spyOn(redisKeyService, 'getPupilRegisterViewDataKey').mockImplementation()
      })

      test('when saved successfully', async () => {
        const pr = await pupilUploadService.upload(schoolMock, dummyCSV, userId)
        expect(pr.message).toBe('No pupils were saved')
      })
    })
  })
})
