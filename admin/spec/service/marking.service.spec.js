'use strict'
/* global describe, beforeEach, afterEach, it, expect */
const sinon = require('sinon')
const proxyquire = require('proxyquire').noCallThru()

const checkDataService = require('../../services/data-access/check.data.service')
const completedCheckDataService = require('../../services/data-access/completed-check.data.service')
const completedCheckMock = require('../mocks/completed-check')

describe('markingService', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#mark', () => {
    let checkDataServiceStub, completedCheckDataServiceStub
    beforeEach(() => {
      checkDataServiceStub = sandbox.stub(checkDataService, 'sqlUpdateCheckWithResults')
      completedCheckDataServiceStub = sandbox.stub(completedCheckDataService, 'save')
      service = proxyquire('../../services/marking.service', {
        './data-access/completed-check.data.service': completedCheckDataService,
        './data-access/check.data.service': checkDataService
      })
    })

    it('throws an error if the arg is missing', async (done) => {
      try {
        await service.mark()
        expect('this').toBe('thrown')
      } catch (err) {
        expect(err.message).toBe('missing or invalid argument')
      }
      done()
    })

    it('throws an error if the arg is invalid', async (done) => {
      try {
        await service.mark({data: ''})
        expect('this').toBe('thrown')
      } catch (err) {
        expect(err.message).toBe('missing or invalid argument')
      }
      done()
    })

    it('throws an error if the arg is invalid', async (done) => {
      try {
        await service.mark({data: {answers: null}})
        expect('this').toBe('thrown')
      } catch (err) {
        expect(err.message).toBe('missing or invalid argument')
      }
      done()
    })

    it('marks the answers', async (done) => {
      await service.mark(completedCheckMock)
      const markedAnswers = completedCheckDataServiceStub.args[0][0].data.answers
      expect(markedAnswers[0].isCorrect).toBe(true)
      expect(markedAnswers[1].isCorrect).toBe(false)
      expect(markedAnswers[2].isCorrect).toBe(false)
      expect(markedAnswers[3].isCorrect).toBe(false)
      done()
    })

    it('adds isMarked and markedAt properties', async (done) => {
      await service.mark(completedCheckMock)
      const cc = completedCheckDataServiceStub.args[0][0]
      expect(cc.isMarked).toBeTruthy()
      expect(cc.markedAt).toBeTruthy()
      done()
    })

    it('saves the marked answers', async (done) => {
      await service.mark(completedCheckMock)
      expect(completedCheckDataServiceStub.called).toBeTruthy()
      done()
    })

    it('saves the scores', async (done) => {
      await service.mark(completedCheckMock)
      expect(checkDataServiceStub.called).toBeTruthy()
      done()
    })

    it('gives the pupil the correct marks', async (done) => {
      await service.mark(completedCheckMock)
      const mark = checkDataServiceStub.args[0][1]
      expect(mark).toBe(3)

      const maxMark = checkDataServiceStub.args[0][2]
      expect(maxMark).toBe(6)

      const markedAt = checkDataServiceStub.args[0][3]
      expect(markedAt).toBeTruthy()
      done()
    })
  })

  describe('#batchMark', () => {
    let completedCheckDataServiceStub, serviceMarkStub
    beforeEach(() => {
      sandbox.stub(checkDataService)
      completedCheckDataServiceStub = sandbox.stub(completedCheckDataService, 'find').resolves([
        {dummy: 'object'},
        {dummy: 'object'},
        {dummy: 'object'}
      ])
      service = proxyquire('../../services/marking.service', {
        './data-access/completed-check.data.service': completedCheckDataService,
        './data-access/check.data.service': checkDataService
      })
      serviceMarkStub = sandbox.stub(service, 'mark')
    })

    it('throws an error if called without an arg', async (done) => {
      try {
        await service.batchMark()
        expect('this').toBe('thrown')
      } catch (err) {
        expect(err.message).toBe('Missing arg batchIds')
      }
      done()
    })

    it('throws an error if called with an empty array', async (done) => {
      try {
        await service.batchMark([])
        expect('this').toBe('thrown')
      } catch (err) {
        expect(err.message).toBe('No documents to mark')
      }
      done()
    })

    it('bulk retrieves the completedChecks', async (done) => {
      await service.batchMark([1, 2, 3])
      expect(completedCheckDataServiceStub.called).toBeTruthy()
      done()
    })

    it('marks each retrieved completedCheck', async (done) => {
      await service.batchMark([1, 2, 3])
      expect(serviceMarkStub.callCount).toBe(3)
      done()
    })

    it('ignores errors from mark() and carries on processing', async (done) => {
      serviceMarkStub.onSecondCall().throws('mock error')
      sandbox.stub(global.console, 'error')
      await service.batchMark([1, 2, 3])
      expect(serviceMarkStub.callCount).toBe(3)
      done()
    })
  })
})
