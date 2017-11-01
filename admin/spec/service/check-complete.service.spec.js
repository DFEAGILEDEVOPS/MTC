'use strict'
/* global jasmine describe beforeEach it expect */

const proxyquire = require('proxyquire').noCallThru()

describe('check-complete.service', () => {
  let service
  let spy
  let markingSpy

  function setupService (cb) {
    spy = jasmine.createSpy('create').and.callFake(cb)
    markingSpy = jasmine.createSpy('mark').and.callFake(cb)
    return proxyquire('../../services/check-complete.service', {
      './data-access/completed-check.data.service': {
        create: spy
      },
      './marking.service': {
        mark: markingSpy
      }
    })
  }

  describe('happy path', () => {
    beforeEach(() => {
      service = setupService(function () { return Promise.resolve(null) })
    })

    it('calls the data service', async (done) => {
      await service.completeCheck({})
      expect(spy).toHaveBeenCalledTimes(1)
      expect(markingSpy).toHaveBeenCalledTimes(1)
      done()
    })

    it('adds a timestamp', async (done) => {
      await service.completeCheck({})
      const args = spy.calls.mostRecent().args[0]
      expect(args.hasOwnProperty('receivedByServerAt')).toBe(true)
      done()
    })
  })
})
