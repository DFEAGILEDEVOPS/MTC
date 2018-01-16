'use strict'
/* global jasmine describe beforeEach afterEach it expect spyOn */
const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const jwtService = require('../../services/jwt.service')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const pupilMock = require('../mocks/pupil')

describe('check-complete.service', () => {
  let service
  let spy
  let markingSpy

  let sandbox

  beforeEach(() => { sandbox = sinon.sandbox.create() })

  afterEach(() => sandbox.restore())

  function setupService (cb) {
    const pupil = Object.assign({}, pupilMock)
    spy = jasmine.createSpy('sqlAddResult').and.callFake(cb)
    markingSpy = jasmine.createSpy('mark').and.callFake(cb)
    sandbox.mock(pupilDataService).expects('findOne').resolves(pupil)
    sandbox.mock(jwtService).expects('decode').resolves({ sub: '49g872ebf624b75400fbee09' })
    spyOn(pupilDataService, 'update').and.returnValue(null)
    return proxyquire('../../services/check-complete.service', {
      './data-access/completed-check.data.service': {
        sqlAddResult: spy
      },
      './marking.service': {
        mark: markingSpy
      },
      '../../services/data-access/pupil.data.service': pupilDataService,
      '../../services/jwt.service': jwtService
    })
  }

  describe('happy path', () => {
    beforeEach(() => {
      service = setupService(function () { return Promise.resolve(null) })
    })

    it('calls pupil data service update method when pin exists', async (done) => {
      await service.completeCheck({ data: {} })
      expect(pupilDataService.update).toHaveBeenCalledTimes(1)
      done()
    })

    it('calls the completed check data service', async (done) => {
      await service.completeCheck({ data: {} })
      expect(spy).toHaveBeenCalledTimes(1)
      expect(markingSpy).toHaveBeenCalledTimes(1)
      done()
    })

    it('adds a timestamp', async (done) => {
      await service.completeCheck({ data: {} })
      const args = spy.calls.mostRecent().args[0]
      expect(args.hasOwnProperty('receivedByServerAt')).toBe(true)
      done()
    })
  })
})
