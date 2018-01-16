'use strict'
/* global describe, expect, it, beforeEach, afterEach */

const sinon = require('sinon')
require('sinon-mongoose')
const proxyquire = require('proxyquire').noCallThru()

const psReportCacheDataService = require('../../services/data-access/ps-report-cache.data.service')
const completedCheckDataService = require('../../services/data-access/completed-check.data.service')
const checkDataService = require('../../services/data-access/check.data.service')

// Get a marked check mock
const checkMockOrig = require('../mocks/check-with-results')

// and a completedCheck that has been marked
const completedCheckMockOrig = require('../mocks/completed-check-with-results')
const pupilMockOrig = require('../mocks/pupil')
const schoolMockOrig = require('../mocks/school')

const completedCheckMock = Object.assign({ check: {} }, completedCheckMockOrig)
const checkMock = Object.assign({}, checkMockOrig)
const pupilMock = Object.assign({}, pupilMockOrig)
const schoolMock = Object.assign({}, schoolMockOrig)
completedCheckMock.check = checkMock
pupilMock.school = schoolMock
completedCheckMock.check.pupilId = pupilMock

describe('psychometricians-report.service', () => {
  let sandbox, service

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#batchProduceCacheData', () => {
    let completedCheckDataServiceStub, serviceProduceCacheStub, servicePopulateWithCheck

    beforeEach(() => {
      completedCheckDataServiceStub = sandbox.stub(completedCheckDataService, 'sqlFindByIds')

      service = proxyquire('../../services/psychometrician-report.service', {
        './data-access/completed-check.data.service': completedCheckDataService,
        './data-access/ps-report-cache.data.service': psReportCacheDataService
      })

      // We don't actually want to call these internal methods as is not under test for this describe block
      serviceProduceCacheStub = sandbox.stub(service, 'produceCacheData')
      servicePopulateWithCheck = sandbox.stub(service, 'populateWithCheck')
    })

    it('throws an error if not provided with an argument', async (done) => {
      try {
        await service.batchProduceCacheData()
        expect('this').toBe('to be thrown')
      } catch (error) {
        expect(error.message).toBe('Missing argument: batchIds')
      }
      done()
    })

    it('throws an error if not provided with a array of positive length', async (done) => {
      try {
        await service.batchProduceCacheData(123)
        expect('this').toBe('to be thrown')
      } catch (error) {
        expect(error.message).toBe('Invalid arg: batchIds')
      }
      done()
    })

    it('retrieves all the batchIds in one go', async (done) => {
      completedCheckDataServiceStub.resolves([
        {mock: 'object'},
        {mock: 'object'},
        {mock: 'object'}
      ])
      try {
        await service.batchProduceCacheData([1, 2, 3])
        expect(completedCheckDataServiceStub.callCount).toBe(1)
      } catch (error) {
        expect('this').toBe('NOT to be thrown')
        console.error(error)
      }
      done()
    })

    it('calls populateWithCheck() to ensure ensure all check information is available', async (done) => {
      completedCheckDataServiceStub.resolves([
        {mock: 'object'},
        {mock: 'object'},
        {mock: 'object'}
      ])
      try {
        await service.batchProduceCacheData([1, 2, 3])
        expect(servicePopulateWithCheck.callCount).toBe(1)
      } catch (error) {
        expect('this').toBe('NOT to be thrown')
      }
      done()
    })

    it('calls produceCacheData for each check', async (done) => {
      completedCheckDataServiceStub.resolves([
        {mock: 'object'},
        {mock: 'object'},
        {mock: 'object'}
      ])
      try {
        await service.batchProduceCacheData([1, 2, 3])
        expect(serviceProduceCacheStub.callCount).toBe(3)
      } catch (error) {
        expect('this').toBe('NOT to be thrown')
      }
      done()
    })
  })

  describe('#produceCacheData', () => {
    let psReportCacheDataServiceStub, serviceProduceReportDataStub

    beforeEach(() => {
      psReportCacheDataServiceStub = sandbox.stub(psReportCacheDataService, 'save')
      service = proxyquire('../../services/psychometrician-report.service', {
        './data-access/ps-report-cache.data.service': psReportCacheDataService
      })
      // stub out the produceReportData method
      serviceProduceReportDataStub = sandbox.stub(service, 'produceReportData')
    })

    it('throws an error if not called with an argument', async (done) => {
      try {
        await service.produceCacheData()
        expect('this').toBe('to be thrown')
      } catch (error) {
        expect(error.message).toBe('Missing argument: completedCheck')
      }
      done()
    })

    it('throws an error if not called with a completedCheck as an argument', async (done) => {
      try {
        await service.produceCacheData(123)
        expect('this').toBe('to be thrown')
      } catch (error) {
        expect(error.message).toBe('Invalid argument: completedCheck')
      }
      done()
    })

    it('generates the report data', async (done) => {
      try {
        await service.produceCacheData(completedCheckMock)
        expect(serviceProduceReportDataStub.callCount).toBe(1)
      } catch (error) {
        expect(error).toBeUndefined()
        expect('this').toBe('NOT to be thrown')
      }
      done()
    })

    it('saves the data in the db', async (done) => {
      try {
        await service.produceCacheData(completedCheckMock)
        expect(psReportCacheDataServiceStub.callCount).toBe(1)
      } catch (error) {
        expect(error).toBeUndefined()
        expect('this').toBe('NOT to be thrown')
      }
      done()
    })
  })

  describe('#produceReportData', () => {
    let service
    beforeEach(() => {
      service = require('../../services/psychometrician-report.service')
    })
    it('returns the data', () => {
      sandbox.stub(console, 'log')
      const data = service.produceReportData(completedCheckMock)
      expect(data).toBeTruthy()
      expect(data.Surname).toBeTruthy()
      expect(data.Forename).toBeTruthy()
    })
  })

  describe('#populateWithCheck', () => {
    let checkDataServiceStub

    beforeEach(() => {
      checkDataServiceStub = sandbox.stub(checkDataService, 'sqlFindFullyPopulated')
      service = proxyquire('../../services/psychometrician-report.service', {
        './data-access/check.data.service': checkDataService
      })
    })

    it('calls the checkDataService to retrieve the checks', async (done) => {
      try {
        checkDataServiceStub.resolves([checkMockOrig])
        await service.populateWithCheck([completedCheckMock])
        expect(checkDataServiceStub.callCount).toBe(1)
      } catch (error) {
        expect('this').toBe('NOT to be thrown')
        console.error(error)
      }
      done()
    })

    it('splices the check into the completedCheck object', async (done) => {
      try {
        checkDataServiceStub.resolves([checkMockOrig])
        const completedChecks = [completedCheckMock]
        await service.populateWithCheck(completedChecks)
        expect(completedChecks[0].check).toBeDefined()
        expect(completedChecks[0].check.results.marks).toBe(7)
      } catch (error) {
        expect('this').toBe('NOT to be thrown')
        console.error(error)
      }
      done()
    })
  })

  describe('#generateReport', () => {
    let service, psReportCacheDataServiceStub

    beforeEach(() => {
      psReportCacheDataServiceStub = sandbox.stub(psReportCacheDataService, 'find').resolves([
        {data: {propOne: 'valOne', propTwo: 1}},
        {data: {propOne: 'ValTwo', propTwo: 2}},
        {data: {propOne: 'valThree', propTwo: null}}
      ])
      service = proxyquire('../../services/psychometrician-report.service', {
        './data-access/ps-report-cache.data.service': psReportCacheDataService
      })
    })

    it('returns a csv string', async (done) => {
      const res = await service.generateReport()
      expect(res).toBeTruthy()
      expect(res.substr(0, 7)).toBe('propOne')
      expect(psReportCacheDataServiceStub.callCount).toBe(1)
      done()
    })
  })

  describe('#generateScoreReport', () => {
    let service, psReportCacheDataServiceStub

    beforeEach(() => {
      psReportCacheDataServiceStub = sandbox.stub(psReportCacheDataService, 'find').resolves([
        {data: {Surname: 'valOne', propTwo: 1}},
        {data: {Forename: 'ValTwo', propTwo: 2}},
        {data: {MiddleNames: 'valThree', propTwo: null}}
      ])
      service = proxyquire('../../services/psychometrician-report.service', {
        './data-access/ps-report-cache.data.service': psReportCacheDataService
      })
    })

    it('returns a csv string', async (done) => {
      const res = await service.generateReport()
      expect(res).toBeTruthy()
      expect(res.substr(0, 7)).toBe('Surname')
      expect(psReportCacheDataServiceStub.callCount).toBe(1)
      done()
    })
  })
})
