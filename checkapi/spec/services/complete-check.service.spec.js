'use strict'
/* global jasmine describe xdescribe beforeEach it expect */

const proxyquire = require('proxyquire').noCallThru()

xdescribe('complete-check.service', () => {
  let service
  let spy

  function setupService (cb) {
    spy = jasmine.createSpy('create').and.callFake(cb)

    return proxyquire('../../services/complete-check.service', {
      './data-access/complete-check.data.service': {
        create: spy
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
