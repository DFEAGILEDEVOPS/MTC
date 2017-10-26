'use strict'
/* global describe, expect, it, beforeEach, afterEach */

const sinon = require('sinon')
require('sinon-mongoose')
const proxyquire = require('proxyquire').noCallThru()

const psReportCacheDataService = require('../../services/data-access/ps-report-cache.data.service')
const completedCheckDataService = require('../../services/data-access/completed-check.data.service')
const checkDataService = require('../../services/data-access/check.data.service')

// Get a marked check mock
const checkMock = require('../mocks/check-with-results')

// and a completedCheck that has been marked
const completedCheckMock = require('../mocks/completed-check-with-results')

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
      completedCheckDataServiceStub = sandbox.stub(completedCheckDataService, 'find')

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
    let psReportCacheDataServiceStub

    beforeEach(() => {
      psReportCacheDataServiceStub = sandbox.stub(psReportCacheDataService, 'save')
      service = proxyquire('../../services/psychometrician-report.service', {
        './data-access/ps-report-cache.data.service': psReportCacheDataService
      })
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

    // it('saves the data in the db', async (done) => {
    //   try {
    //     await service.produceCacheData(123)
    //     expect(psReportCacheDataServiceStub.callCount).toBe(1)
    //   } catch (error) {
    //     expect(error).toBeUndefined()
    //     expect('this').toBe('NOT to be thrown')
    //   }
    //   done()
    // })
  })

  describe('#populateWithCheck', () => {
    let checkDataServiceStub

    beforeEach(() => {
      checkDataServiceStub = sandbox.stub(checkDataService, 'findFullyPopulated')
      service = proxyquire('../../services/psychometrician-report.service', {
        './data-access/check.data.service': checkDataService
      })
    })

    it('calls the checkDataService to retrieve the checks', async (done) => {
      try {
        checkDataServiceStub.resolves([checkMock])
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
        checkDataServiceStub.resolves([checkMock])
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
})
