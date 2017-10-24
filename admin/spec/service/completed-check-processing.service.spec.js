'use strict'
/* global describe, beforeEach, afterEach, it, expect */
const sinon = require('sinon')
const proxyquire = require('proxyquire').noCallThru()

const completedCheckDataService = require('../../services/data-access/completed-check.data.service')
const markingService = require('../../services/marking.service')

describe('completedCheckProcessingService', () => {
  let service, sandbox
  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })
  afterEach(() => sandbox.restore())

  describe('#markAndProcess', () => {
    let completedCheckDataServiceStub, markingServiceStub
    beforeEach(() => {
      completedCheckDataServiceStub = sandbox.stub(completedCheckDataService, 'findUnmarked')
      markingServiceStub = sandbox.stub(markingService, 'batchMark')
      service = proxyquire('../../services/completed-check-processing.service', {
        './data-access/completed-check.data.service': completedCheckDataService,
        './marking.service': markingService
      })
      sandbox.stub(console, 'log')
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

    it('it returns true', async (done) => {
      completedCheckDataServiceStub.resolves([1, 2, 3])
      const res = await service.markAndProcess(10)
      expect(res).toBeTruthy()
      done()
    })
  })

  describe('#process', () => {
    let completedCheckDataServiceStub, serviceMarkStub
    beforeEach(() => {
      completedCheckDataServiceStub = sandbox.stub(completedCheckDataService, 'hasUnmarked')
      sandbox.stub(markingService)
      service = proxyquire('../../services/completed-check-processing.service', {
        './data-access/completed-check.data.service': completedCheckDataService,
        './marking.service': markingService
      })
      serviceMarkStub = sandbox.stub(service, 'markAndProcess')
      sandbox.stub(console, 'log')
    })

    it('initially find out if there is any work to do', async (done) => {
      completedCheckDataServiceStub.resolves(false)
      await service.process()
      expect(completedCheckDataServiceStub.called).toBeTruthy()
      done()
    })

    it('calls markAndProcess to handle any work', async (done) => {
      completedCheckDataServiceStub.onCall(0).resolves(true).onCall(1).resolves(false)
      await service.process()
      expect(completedCheckDataServiceStub.callCount).toBe(2)
      expect(serviceMarkStub.callCount).toBe(1)
      done()
    })
  })
})
