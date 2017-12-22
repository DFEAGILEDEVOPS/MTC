'use strict'

/* global describe it expect jasmine */

const proxyquire = require('proxyquire').noCallThru()
const { ObjectId } = require('mongoose').Types

const checkWindowMock = require('../mocks/check-window')
const checkFormMock = require('../mocks/check-form')
const resolvesNull = function () { return Promise.resolve(null) }
const resolvesObject = function () { return Promise.resolve({}) }

describe('check-start.service', () => {
  describe('startCheck', () => {
    let service, pupilId, checkDataServiceCreateSpy

    function setupService (options) {
      pupilId = ObjectId()
      checkDataServiceCreateSpy = jasmine.createSpy('checkDataServiceCreateSpy')

      return proxyquire('../../services/check-start.service', {
        '../services/data-access/check-window.data.service': {
          fetchCurrentCheckWindow: jasmine.createSpy().and.callFake(
            function () { return Promise.resolve(checkWindowMock) }
          )
        },
        '../services/check-form.service': {
          allocateCheckForm: jasmine.createSpy().and.callFake(
            function () { return Promise.resolve(checkFormMock) }
          )
        },
        '../services/data-access/check.data.service': {
          create: checkDataServiceCreateSpy.and.callFake(
            resolvesNull
          ),
          sqlFindOneByCheckCode: jasmine.createSpy().and.callFake(
            options.sqlFindOneByCheckCode
          )
        }
      })
    }

    describe('happy path', () => {
      it('returns a checkCode and a checkForm', async (done) => {
        service = setupService({sqlFindOneByCheckCode: resolvesNull})
        try {
          const res = await service.startCheck(pupilId)
          expect(res.checkCode).toBeDefined()
          expect(res.checkForm).toBeDefined()
          expect(checkDataServiceCreateSpy).toHaveBeenCalled()
        } catch (error) {
          // we are not expecting the happy path to throw
          expect(error).toBeUndefined()
        }
        done()
      })
    })

    describe('error path', () => {
      it('throws an error when the checkCode is not unique', async (done) => {
        service = setupService({sqlFindOneByCheckCode: resolvesObject})
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
