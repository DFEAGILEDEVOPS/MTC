'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')

const CompletedChecks = require('../../../models/completed-checks')
const completedChecksMock = require('../../mocks/completed-check')
const mongoResponseMock = require('../../mocks/mongo-response-mock')

describe('completed-checks.data.service', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#create', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(CompletedChecks.prototype).expects('save').resolves(completedChecksMock)
      service = proxyquire('../../../services/data-access/completed-check.data.service', {
        '../../models/completed-checks': CompletedChecks
      })
    })

    it('calls the model', async (done) => {
      await service.create({ mock: 'object' })
      expect(mock.verify()).toBe(true)
      done()
    })
  })

  describe('#save', () => {
    let mock
    beforeEach(() => {
      mock = sandbox.mock(CompletedChecks).expects('replaceOne').chain('exec').resolves(mongoResponseMock)
      service = proxyquire('../../../services/data-access/completed-check.data.service', {
        '../../models/completed-checks': CompletedChecks
      })
    })

    it('allows a plain object to be saved', async (done) => {
      await service.save({ _id: 123, data: {}, isMarked: true, markedAt: new Date() })
      expect(mock.verify()).toBe(true)
      done()
    })
  })

  describe('#find', () => {
    let mock
    beforeEach(() => {
      mock = sandbox.mock(CompletedChecks).expects('find').chain('exec').resolves([ completedChecksMock ])
      service = proxyquire('../../../services/data-access/completed-check.data.service', {
        '../../models/completed-checks': CompletedChecks
      })
    })

    it('finds an object in the db', async (done) => {
      await service.find({ _id: completedChecksMock._id })
      expect(mock.verify()).toBe(true)
      done()
    })
  })

  describe('#count', () => {
    let mock
    beforeEach(() => {
      mock = sandbox.mock(CompletedChecks).expects('count').chain('exec').resolves(1)
      service = proxyquire('../../../services/data-access/completed-check.data.service', {
        '../../models/completed-checks': CompletedChecks
      })
    })

    it('counts docs in the db', async (done) => {
      await service.count({ searchCriteria: 'someValue' })
      expect(mock.verify()).toBe(true)
      done()
    })
  })

  describe('#hasUnmarked', () => {
    let mock

    describe('finds some docs', () => {
      beforeEach(() => {
        mock = sandbox.mock(CompletedChecks).expects('count').chain('exec').resolves(42)
        service = proxyquire('../../../services/data-access/completed-check.data.service', {
          '../../models/completed-checks': CompletedChecks
        })
      })

      it('counts docs in the db', async (done) => {
        const res = await service.hasUnmarked({ searchCriteria: 'someValue' })
        expect(mock.verify()).toBe(true)
        expect(res).toBe(true)
        done()
      })
    })

    describe('finds nothing', () => {
      beforeEach(() => {
        mock = sandbox.mock(CompletedChecks).expects('count').chain('exec').resolves(0)
        service = proxyquire('../../../services/data-access/completed-check.data.service', {
          '../../models/completed-checks': CompletedChecks
        })
      })

      it('and it returns false ', async (done) => {
        const res = await service.hasUnmarked({ searchCriteria: 'someValue' })
        expect(mock.verify()).toBe(true)
        expect(res).toBe(false)
        done()
      })
    })
  })

  describe('#findUnmarked', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(CompletedChecks)
        .expects('find')
        .chain('limit')
        .chain('lean')
        .chain('exec')
        .resolves([ 123, 456, 789 ])
      service = proxyquire('../../../services/data-access/completed-check.data.service', {
        '../../models/completed-checks': CompletedChecks
      })
    })

    it('throws if not given a batchSize', async () => {
      try {
        await service.findUnmarked()
        expect('this').toBe('thrown')
      } catch (err) {
        expect(err.message).toBe('Missing argument: batchSize')
      }
    })

    it('makes the expected calls', async (done) => {
      service.findUnmarked(100)
      expect(mock.verify()).toBe(true)
      done()
    })
  })

  describe('#update', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(CompletedChecks)
        .expects('update')
        .chain('exec')
        .resolves(mongoResponseMock)
      service = proxyquire('../../../services/data-access/completed-check.data.service', {
        '../../models/completed-checks': CompletedChecks
      })
    })

    it('makes the expected calls', async (done) => {
      await service.update({}, {$set: {isMock: true}})
      expect(mock.verify()).toBe(true)
      done()
    })
  })
})
