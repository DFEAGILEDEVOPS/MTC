'use strict'

/* global describe expect it */

const proxyquire = require('proxyquire').noCallThru()

const MongooseModelMock = require('../mocks/mongoose-model-mock')
const checkWindowMock = require('../mocks/check-window')

describe('check-window.service', () => {
  let service = require('../../services/check-window.service')

  function setupService (cb) {
    return proxyquire('../../services/check-window.service', {
      '../models/check-window': new MongooseModelMock(cb)
    })
  }

  describe('#getCurrentCheckWindow', () => {
    it('returns a current check window', async (done) => {
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
})
