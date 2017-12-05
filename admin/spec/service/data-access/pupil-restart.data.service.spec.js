'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')

const PupilRestart = require('../../../models/pupil-restart')
const RestartCode = require('../../../models/restart-code')
const pupilRestartMock = require('../../mocks/pupil-restart')
const restartCodesMock = require('../../mocks/restart-codes')

describe('pupil-restart.data.service', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#create', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(PupilRestart.prototype).expects('save').resolves(pupilRestartMock)
      service = proxyquire('../../../services/data-access/pupil-restart.data.service', {
        '../../models/pupil-restarts': PupilRestart
      })
    })

    it('calls the model', async (done) => {
      await service.create({ mock: 'object' })
      expect(mock.verify()).toBe(true)
      done()
    })
  })
  describe('#count', () => {
    let mock
    beforeEach(() => {
      mock = sandbox.mock(PupilRestart).expects('count').chain('exec').resolves(1)
      service = proxyquire('../../../services/data-access/pupil-restart.data.service', {
        '../../models/pupil-restarts': PupilRestart
      })
    })

    it('counts docs in the db', async (done) => {
      await service.count({ searchCriteria: 'someValue' })
      expect(mock.verify()).toBe(true)
      done()
    })
  })
  describe('#findOne', () => {
    let mock
    beforeEach(() => {
      mock = sandbox.mock(PupilRestart).expects('findOne').chain('exec').resolves(pupilRestartMock)
      service = proxyquire('../../../services/data-access/pupil-restart.data.service', {
        '../../models/pupil-restarts': PupilRestart
      })
    })

    it('counts docs in the db', async (done) => {
      await service.findOne({ _id: 'some-id' })
      expect(mock.verify()).toBe(true)
      done()
    })
  })

  describe('#getRestartcodes', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(RestartCode).expects('find').chain('sort').resolves(restartCodesMock)
      service = proxyquire('../../../services/data-access/pupil-restart.data.service', {
        '../../models/restart-code': RestartCode
      })
    })

    it('should return a list of attendance codes', () => {
      service.getRestartCodes()
      expect(mock.verify()).toBe(true)
    })
  })
})
