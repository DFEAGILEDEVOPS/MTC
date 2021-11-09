'use strict'

const path = require('path')
const pupilUploadService = require('../../../services/pupil-upload.service')
const schoolMock = require('../mocks/school')
const generateErrorCSVService = require('../../../services/generate-error-csv.service')
const validateCSVService = require('../../../services/validate-csv.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const redisCacheService = require('../../../services/data-access/redis-cache.service')
const redisKeyService = require('../../../services/redis-key.service')

const dummyCSV = {
  file: path.join(__dirname, '../../../data/fixtures/dummy.csv')
}

/* global beforeEach, describe, it, expect spyOn jest */

describe('pupil-upload service', () => {
  describe('upload', () => {
    beforeEach(() => {
      validateCSVService.process = jest.fn(async () => {
        return {
          validationErrors: { errors: '' },
          hasValidationError: true
        }
      })
      redisCacheService.drop = jest.fn()
    })

    it('returns an object after utilizing the promisified csv library', async () => {
      const pr = await pupilUploadService.upload(schoolMock, dummyCSV)
      expect(pr).toBeDefined()
      expect(typeof pr).toBe('object')
      expect(pr.fileErrors.errors).toBe('')
    })
  })

  describe('generates csv validation errors', () => {
    beforeEach(() => {
      spyOn(validateCSVService, 'process').and.returnValue({
        csvData: [['test', 'test', 'test', 'test', 'test', 'test', 'Error'],
          ['test', 'test', 'test', 'test', 'test', 'test', 'Error']]
      })

      describe('on csv error', () => {
        beforeEach(() => {
          spyOn(generateErrorCSVService, 'generate').and.returnValue({ file: { name: 'test.csv' } })
        })

        it('returns error csv file if csv has errors', async () => {
          const pr = await pupilUploadService.upload(schoolMock, dummyCSV)
          expect(pr.csvErrorFile).toBe('test.csv')
        })
      })
      describe('on csv generation error', () => {
        spyOn(generateErrorCSVService, 'generate').and.returnValue({ error: 'error' })
      })

      it('returns error csv file if csv has errors', async () => {
        const pr = await pupilUploadService.upload(schoolMock, dummyCSV)
        expect(pr.error).toBe('error')
      })
    })
  })

  describe('attempts to save csv errors', () => {
    beforeEach(() => {
      spyOn(validateCSVService, 'process').and.returnValue({
        csvData: [['test', 'test', 'test', 'test', 'test', 'test'],
          ['test', 'test', 'test', 'test', 'test', 'test']]
      })
      spyOn(generateErrorCSVService, 'generate').and.returnValue({ file: { name: 'test.csv' } })
    })
    describe('and returns an object with pupils', () => {
      beforeEach(() => {
        spyOn(pupilDataService, 'sqlInsertMany').and.returnValue({ insertId: [1, 2], rowsModified: 4 })
        spyOn(redisCacheService, 'drop')
        spyOn(redisKeyService, 'getPupilRegisterViewDataKey')
      })
      it('when saved successfully', async () => {
        const pr = await pupilUploadService.upload(schoolMock, dummyCSV)
        expect(pr.pupilIds.length).toBe(2)
        expect(pr).toEqual({ pupilIds: [1, 2] })
      })
    })
    describe('and returns an object with an error if save fails', () => {
      beforeEach(() => {
        spyOn(pupilDataService, 'sqlInsertMany').and.returnValue(null)
        spyOn(redisCacheService, 'drop')
        spyOn(redisKeyService, 'getPupilRegisterViewDataKey')
      })
      it('when saved successfully', async () => {
        const pr = await pupilUploadService.upload(schoolMock, dummyCSV)
        expect(pr.message).toBe('No pupils were saved')
      })
    })
  })
})
