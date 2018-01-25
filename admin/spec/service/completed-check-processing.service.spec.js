'use strict'
/* global describe, beforeEach, afterEach, it, expect, spyOn */
const sinon = require('sinon')
const proxyquire = require('proxyquire').noCallThru()
const winston = require('winston')

const completedCheckDataService = require('../../services/data-access/completed-check.data.service')
const markingService = require('../../services/marking.service')
const psychometricianReportService = require('../../services/psychometrician-report.service')

describe('completedCheckProcessingService', () => {
  let service, sandbox
  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })
  afterEach(() => sandbox.restore())

  describe('#markAndProcess', () => {
    let completedCheckDataServiceStub, markingServiceStub, psychometricianReportServiceStub
    beforeEach(() => {
      completedCheckDataServiceStub = sandbox.stub(completedCheckDataService, 'sqlFindUnmarked')
      psychometricianReportServiceStub = sandbox.stub(psychometricianReportService, 'batchProduceCacheData')
      markingServiceStub = sandbox.stub(markingService, 'batchMark')
      service = proxyquire('../../services/completed-check-processing.service', {
        './data-access/completed-check.data.service': completedCheckDataService,
        './marking.service': markingService
      })
      sandbox.stub(winston, 'info')
    })

    it('bails out early if the array is empty', async (done) => {
      completedCheckDataServiceStub.resolves([])
      const res = await service.markAndProcess(10)
      expect(res).toBeFalsy()
      done()
    })

    it('it calls the marking service', async (done) => {
      completedCheckDataServiceStub.resolves([1, 2, 3])
      await service.markAndProcess(10)
      expect(markingServiceStub.called).toBeTruthy()
      done()
    })

    it('it calls the psychometrician report service', async (done) => {
      completedCheckDataServiceStub.resolves([1, 2, 3])
      await service.markAndProcess(10)
      expect(psychometricianReportServiceStub.callCount).toBe(1)
      done()
    })

    it('it returns true', async (done) => {
      completedCheckDataServiceStub.resolves([1, 2, 3])
      const res = await service.markAndProcess(10)
      expect(res).toBeTruthy()
      done()
    })
  })

  describe('#process', () => {
    const service = require('../../services/completed-check-processing.service')
    it('initially find out if there is any work to do', async (done) => {
      spyOn(completedCheckDataService, 'sqlHasUnmarked').and.returnValue(false)
      spyOn(service, 'markAndProcess').and.returnValue(true)
      await service.process()
      expect(completedCheckDataService.sqlHasUnmarked).toHaveBeenCalled()
      expect(service.markAndProcess).not.toHaveBeenCalled()
      done()
    })

    it('calls markAndProcess to handle any work', async (done) => {
      spyOn(completedCheckDataService, 'sqlHasUnmarked').and.returnValues(true, false)
      spyOn(service, 'markAndProcess').and.returnValue(true)

      await service.process()
      expect(completedCheckDataService.sqlHasUnmarked).toHaveBeenCalled()
      expect(service.markAndProcess).toHaveBeenCalledTimes(1)
      done()
    })
  })
})
