'use strict'
/* global describe, beforeEach, afterEach, it, expect, spyOn */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')

const PupilRestart = require('../../../models/pupil-restart')
const RestartCode = require('../../../models/restart-code')
const pupilRestartMock = require('../../mocks/pupil-restart')
const restartCodesMock = require('../../mocks/restart-codes')
const pupilMock = require('../../mocks/pupil')
const sqlService = require('../../../services/data-access/sql.service')

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
  describe('#findLatest', () => {
    let mock
    beforeEach(() => {
      mock = sandbox.mock(PupilRestart).expects('find').chain('sort').chain('limit').chain('lean').chain('exec').resolves(pupilRestartMock)
      service = proxyquire('../../../services/data-access/pupil-restart.data.service', {
        '../../models/pupil-restarts': PupilRestart
      })
    })

    it('counts docs in the db', async (done) => {
      await service.findLatest({ _id: 'some-id' })
      expect(mock.verify()).toBe(true)
      done()
    })
  })

  describe('#getRestartcodes', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(RestartCode).expects('find').chain('lean').chain('exec').resolves(restartCodesMock)
      service = proxyquire('../../../services/data-access/pupil-restart.data.service', {
        '../../models/restart-code': RestartCode
      })
    })

    it('should return a list of attendance codes', () => {
      service.getRestartCodes()
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#update', () => {
    let mock
    beforeEach(() => {
      mock = sandbox.mock(PupilRestart).expects('updateOne').chain('exec').resolves(pupilRestartMock)
      service = proxyquire('../../../services/data-access/pupil-restart.data.service', {
        '../../models/pupil-restarts': PupilRestart
      })
    })

    it('makes the expected calls', () => {
      service.update(1, { $set: { 'some': 'criteria' } })
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#sqlCreate', () => {
    beforeEach(() => {
      spyOn(sqlService, 'create').and.returnValue(Promise.resolve({ insertId: 1, rowsModified: 1 }))
      service = require('../../../services/data-access/pupil-restart.data.service')
    })

    it('it makes the expected calls', async () => {
      const res = await service.sqlCreate('pupilRestart', pupilRestartMock)
      expect(sqlService.create).toHaveBeenCalled()
      expect(typeof res).toBe('object')
    })
  })

  describe('#sqlGetNumberOfRestartsByPupil', () => {
    beforeEach(() => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve(1))
      service = require('../../../services/data-access/pupil-restart.data.service')
    })

    it('it makes the expected calls', async () => {
      const res = await service.sqlGetNumberOfRestartsByPupil(pupilMock._id)
      expect(sqlService.query).toHaveBeenCalled()
      expect(res).toBe(1)
    })
  })

  describe('#sqlFindLatestRestart', () => {
    beforeEach(() => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([pupilRestartMock]))
      service = require('../../../services/data-access/pupil-restart.data.service')
    })

    it('it makes the expected calls', async () => {
      const res = await service.sqlFindLatestRestart(pupilMock._id)
      expect(sqlService.query).toHaveBeenCalled()
      expect(Array.isArray(res)).toBe(true)
    })
  })

  describe('#sqlFindRestartCodes', () => {
    beforeEach(() => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve(restartCodesMock))
      service = require('../../../services/data-access/pupil-restart.data.service')
    })

    it('it makes the expected calls', async () => {
      const res = await service.sqlFindRestartCodes()
      expect(sqlService.query).toHaveBeenCalled()
      expect(Array.isArray(res)).toBe(true)
    })
  })

  describe('#sqlMarkRestartAsDeleted', () => {
    beforeEach(() => {
      spyOn(sqlService, 'modify').and.returnValue({ rowsModified: 1 })
      service = require('../../../services/data-access/pupil-restart.data.service')
    })

    it('it makes the expected calls', async () => {
      const res = await service.sqlMarkRestartAsDeleted(pupilMock._id, 'some_id')
      expect(sqlService.modify).toHaveBeenCalled()
      expect(typeof res).toBe('object')
    })
  })
})
