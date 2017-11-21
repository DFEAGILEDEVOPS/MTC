'use strict'
/* global describe beforeEach it expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')
const checkFormService = require('../../services/check-form.service')
const checkFormDataService = require('../../services/data-access/check-form.data.service')
const checkWindowService = require('../../services/check-window.service')
const CheckForm = require('../../models/check-form')
const checkFormMock = require('../mocks/check-form')
const checkFormsMock = require('../mocks/check-forms')
const checkFormsFormattedMock = require('../mocks/check-forms-formatted')
const checkWindowsMock = require('../mocks/check-windows')

describe('check-form.service', () => {
  let service
  let sandbox

  beforeEach(() => { sandbox = sinon.sandbox.create() })
  afterEach(() => sandbox.restore())

  function setupService (cb) {
    return proxyquire('../../services/check-form.service', {
      '../services/data-access/check-form.data.service': {
        getActiveFormPlain: jasmine.createSpy().and.callFake(cb)
      },
      '../models/check-form': CheckForm
    })
  }

  describe('#allocateCheckForm - Happy path', () => {
    beforeEach(() => {
      service = setupService(function () { return Promise.resolve(checkFormMock) })
    })

    it('should return a check-form', async (done) => {
      try {
        const checkForm = await service.allocateCheckForm()
        expect(checkForm).toEqual(checkFormMock)
        done()
      } catch (error) {
        console.error(error)
        expect('not expected to throw').toBe(error.message)
        done()
      }
    })

    describe('#prepareQuestionData()', () => {
      it('should prepare the question data', async (done) => {
        try {
          const checkForm = await service.allocateCheckForm()
          const questions = service.prepareQuestionData(checkForm)
          expect(Array.isArray(questions)).toBeTruthy()
          expect(questions.length).toBe(checkFormMock.questions.length)
          questions.forEach((q) => {
            expect(q.hasOwnProperty('order')).toBeTruthy()
            expect(q.hasOwnProperty('factor1')).toBeTruthy()
            expect(q.hasOwnProperty('factor2')).toBeTruthy()
          })
        } catch (error) {
          console.error(error)
          expect('not expected to throw').toBe(error.message)
          done()
        }
        done()
      })
    })
  })

  describe('#allocateCheckForm() - Unhappy path', () => {
    beforeEach(() => {
      service = setupService(function () { return Promise.resolve(null) })
    })

    it('should throw when the check-form is not found', async (done) => {
      try {
        await service.allocateCheckForm()
        expect('not expected to throw').toBe('error')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe('CheckForm not found')
      }
      done()
    })
  })

  describe('#formatCheckFormsAndWindows() - Happy path', () => {
    let checkFormDataServiceStub
    let checkWindowServiceStub

    beforeEach(() => {
      sandbox = sinon.createSandbox()
      checkFormDataServiceStub = sandbox.stub(checkFormDataService, 'fetchSortedActiveForms')
      checkWindowServiceStub = sandbox.stub(checkWindowService, 'getCheckWindowsAssignedToForms')
      sandbox.mock(checkFormService).expects('formatCheckFormsAndWindows').resolves(checkFormsFormattedMock)
      service = proxyquire('../../services/check-form.service', {
        '../services/check-form.service': checkFormService,
        '../services/data-access/check-form.data.service': checkFormDataService,
        '../services/check-window.service': checkWindowService
      })
    })

    afterEach(() => sandbox.restore())

    xit('should return a formatted list of check forms and windows', async (done) => {
      checkFormDataServiceStub.resolves(checkFormsMock).resolves(checkFormsMock)
      checkWindowServiceStub.resolves(checkWindowsMock).resolves(checkWindowsMock)
      try {
        const results = await service.formatCheckFormsAndWindows('name', 'asc')
        console.log('RESULTS', results)
        // const results = await service.formatCheckFormsAndWindows()
        // expect('not expected to throw').toBe('error')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe('CheckForm not found')
      }
      done()
    })
  })

  describe('#unassignedCheckFormsFromCheckWindows() - Happy path', () => {

  })
})
