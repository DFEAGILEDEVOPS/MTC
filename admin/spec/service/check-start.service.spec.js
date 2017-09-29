'use strict'

/* global describe beforeEach it expect jasmine afterEach */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const { ObjectId } = require('mongoose').Types
require('sinon-mongoose')

const checkWindowMock = require('../mocks/check-window')
const checkFormMock = require('../mocks/checkform')
const Check = require('../../models/check')

describe('check-start.service', () => {
  describe('startCheck', () => {
    let service, pupilId, sandbox

    beforeEach(() => { sandbox = sinon.sandbox.create() })
    afterEach(() => sandbox.restore())

    function setupService () {
      pupilId = ObjectId()

      return proxyquire('../../services/check-start.service', {
        '../services/check-window.service': {
          getCurrentCheckWindow: jasmine.createSpy().and.callFake(
            function () { return Promise.resolve(checkWindowMock) }
          )
        },
        '../services/check-form.service': {
          allocateCheckForm: jasmine.createSpy().and.callFake(
            function () { return Promise.resolve(checkFormMock) }
          )
        },
        '../models/check': Check
      })
    }

    describe('happy path', () => {
      it('returns a checkCode and a checkForm', async (done) => {
        sandbox.mock(Check).expects('findOne').chain('lean').chain('exec').resolves(null)
        sandbox.mock(Check.prototype).expects('save').resolves({})
        service = setupService()
        try {
          const res = await service.startCheck(pupilId)
          expect(res.checkCode).toBeDefined()
          expect(res.checkForm).toBeDefined()
        } catch (error) {
          // we are not expecting the happy path to throw
          expect(error).toBeUndefined()
        }
        done()
      })
    })

    describe('error path', () => {
      it('throws an error when the checkCode is not unique', async (done) => {
        sandbox.mock(Check).expects('findOne').chain('lean').chain('exec').resolves({ checkCode: 'found' })
        service = setupService()
        try {
          await service.startCheck(pupilId)
          expect('this is expected to throw').toBe('error')
        } catch (error) {
          expect(error).toBeDefined()
          expect(error.message).toContain('Failed to generate a unique UUID for the check code')
        }
        done()
      })
    })
  })
})
