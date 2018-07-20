'use strict'

const sinon = require('sinon')
const path = require('path')
const proxyquire = require('proxyquire').noCallThru()
const pupilUploadService = require('../../../services/pupil-upload.service')
const schoolMock = require('../mocks/school')
const generateErrorCSVService = require('../../../services/generate-error-csv.service')
const validateCSVService = require('../../../services/validate-csv.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')

const dummyCSV = {
  file: path.join(__dirname, '../../../data/fixtures/dummy.csv')
}

/* global beforeEach, afterEach, describe, it, expect */

describe('pupil-upload service', () => {
  // TODO: Refactor to have a common setup dependencies
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('upload', () => {
    beforeEach(() => {
      sandbox.mock(validateCSVService).expects('process').resolves({
        validationErrors: { errors: '' },
        hasValidationError: true
      })
      proxyquire('../../../services/pupil-upload.service', {
        '../../../services/validate-csv.service': validateCSVService
      })
    })

    it('returns an object after utilizing the promisified csv library', async (done) => {
      const pr = await pupilUploadService.upload(schoolMock, dummyCSV)
      expect(pr).toBeDefined()
      expect(typeof pr).toBe('object')
      expect(pr.fileErrors.errors).toBe('')
      done()
    })
  })

  describe('generates csv validation errors', () => {
    beforeEach(() => {
      sandbox.mock(validateCSVService).expects('process')
        .resolves({
          csvData: [ [ 'test', 'test', 'test', 'test', 'test', 'test', 'Error' ],
            [ 'test', 'test', 'test', 'test', 'test', 'test', 'Error' ] ]
        })
      proxyquire('../../../services/pupil-upload.service', {
        '../../../services/validate-csv.service': validateCSVService
      })
      describe('on csv error', () => {
        beforeEach(() => {
          sandbox.mock(generateErrorCSVService).expects('generate').resolves({ file: { name: 'test.csv' } })
          proxyquire('../../../services/pupil-upload.service', {
            '../../../services/generate-error-csv.service': generateErrorCSVService
          })
        })

        it('returns error csv file if csv has errors', async (done) => {
          const pr = await pupilUploadService.upload(schoolMock, dummyCSV)
          expect(pr.csvErrorFile).toBe('test.csv')
          done()
        })
      })
      describe('on csv generation error', () => {
        sandbox.mock(generateErrorCSVService).expects('generate').resolves({ error: 'error' })
        proxyquire('../../../services/pupil-upload.service', {
          '../../../services/generate-error-csv.service': generateErrorCSVService
        })
      })

      it('returns error csv file if csv has errors', async (done) => {
        const pr = await pupilUploadService.upload(schoolMock, dummyCSV)
        expect(pr.error).toBe('error')
        done()
      })
    })
  })

  describe('attempts to save csv errors', () => {
    beforeEach(() => {
      sandbox.mock(validateCSVService).expects('process')
        .resolves({
          csvData: [ [ 'test', 'test', 'test', 'test', 'test', 'test' ],
            [ 'test', 'test', 'test', 'test', 'test', 'test' ] ]
        })
      sandbox.mock(generateErrorCSVService).expects('generate').resolves({ file: { name: 'test.csv' } })
      proxyquire('../../../services/pupil-upload.service', {
        '../../../services/validate-csv.service': validateCSVService,
        '../../../services/generate-error-csv.service': generateErrorCSVService
      })
    })
    describe('and returns an object with pupils', () => {
      beforeEach(() => {
        sandbox.mock(pupilDataService).expects('sqlInsertMany').resolves({ insertId: [1, 2], rowsModified: 4 })
        proxyquire('../../../services/pupil-upload.service', {
          '../../../services/data-access/pupil.data.service': pupilDataService
        })
      })
      it('when saved successfully', async (done) => {
        const pr = await pupilUploadService.upload(schoolMock, dummyCSV)
        expect(pr.pupilIds.length).toBe(2)
        expect(pr).toEqual({ pupilIds: [1, 2] })
        done()
      })
    })
    describe('and returns an object with an error if save fails', () => {
      beforeEach(() => {
        sandbox.mock(pupilDataService).expects('sqlInsertMany').returns(null)
        proxyquire('../../../services/pupil-upload.service', {
          '../../../services/data-access/pupil.data.service': pupilDataService
        })
      })
      it('when saved successfully', async (done) => {
        const pr = await pupilUploadService.upload(schoolMock, dummyCSV)
        expect(pr.message).toBe('No pupils were saved')
        done()
      })
    })
  })
})
