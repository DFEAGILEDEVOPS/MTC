'use strict'
const moment = require('moment')

/* global describe expect it */

const proxyquire = require('proxyquire').noCallThru()

const MongooseModelMock = require('../mocks/mongoose-model-mock')
const checkWindowMock = require('../mocks/check-window')
const checkWindowsMock = require('../mocks/check-windows')

describe('check-window.service', () => {
  let service = require('../../services/check-window.service')

  function setupService (cb) {
    return proxyquire('../../services/check-window.service', {
      '../models/check-window': new MongooseModelMock(cb)
    })
  }

  describe('#getCurrentCheckWindow', () => {
    it('should return a current check window', async (done) => {
      service = setupService(function () { return Promise.resolve(checkWindowMock) })
      let win
      try {
        win = await service.getCurrentCheckWindow()
      } catch (error) {
        expect('not expect to throw').toBe('error')
      }
      expect(win).toBeDefined()
      done()
    })

    it('throws an error when the check window find throws an error', async (done) => {
      service = setupService(function () { return Promise.reject(new Error('mock error')) })
      try {
        await service.getCurrentCheckWindow()
        expect('expected to throw').toBe('error')
      } catch (error) {
        expect(error).toBeDefined()
      }
      done()
    })

    it('throws an error when it doesn\'t find anything', async (done) => {
      service = setupService(function () { return Promise.resolve(null) })
      try {
        await service.getCurrentCheckWindow()
        expect('expected to throw').toBe('error')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe('No checkwindow is currently available')
      }
      done()
    })
  })

  describe('formatCheckWindowDocuments', () => {
    beforeEach(() => {
      service = setupService(function () { return Promise.resolve(checkWindowMock) })
    })

    it('should return data correctly formatted (1)', () => {
      const isCurrent = true
      const canRemove = false
      const result = service.formatCheckWindowDocuments(checkWindowsMock, isCurrent, canRemove)

      expect(result[0].checkWindowName).toBe('Test window 3')
      expect(result[0].adminStartDate).toBe('18 Oct 2017')
      expect(result[0].checkDates).toBe('10 Jan to 20 Jan 2018')
      expect(result[0].isCurrent).toBe(isCurrent)
      expect(result[0].canRemove).toBe(canRemove)
    })

    it('should return data correctly formatted (2)', () => {
      const isCurrent = false
      const canRemove = false
      const result = service.formatCheckWindowDocuments(checkWindowsMock, isCurrent, canRemove)

      expect(result[1].checkWindowName).toBe('Window Test 1')
      expect(result[1].adminStartDate).toBe('19 Oct 2017')
      expect(result[1].checkDates).toBe('25 Oct to 28 Oct 2017')
      expect(result[1].isCurrent).toBe(isCurrent)
      expect(result[1].canRemove).toBe(canRemove)
    })
  })

  // @TODO: To be finished
})
