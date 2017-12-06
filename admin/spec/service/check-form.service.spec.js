'use strict'
/* global describe beforeEach afterEach it expect jasmine spyOn */

const fs = require('fs-extra')
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
const checkWindowMock = require('../mocks/check-window-2')
const checkWindowsMock = require('../mocks/check-windows')
const checkWindowByForm = require('../mocks/check-window-by-form')

describe('check-form.service', () => {
  let service
  let sandbox

  beforeEach(() => { sandbox = sinon.sandbox.create() })
  afterEach(() => { sandbox.restore() })

  function setupService (cb) {
    return proxyquire('../../services/check-form.service', {
      '../services/data-access/check-form.data.service': {
        getActiveFormPlain: jasmine.createSpy().and.callFake(cb),
        findCheckFormByName: jasmine.createSpy().and.callFake(cb),
        isRowCountValid: jasmine.createSpy().and.callFake(cb)
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

  describe('#formatCheckFormsAndWindows()', () => {
    let checkFormDataServiceStub
    let checkWindowServiceStub

    beforeEach(() => {
      checkFormDataServiceStub = sandbox.stub(checkFormDataService, 'fetchSortedActiveForms')
      checkWindowServiceStub = sandbox.stub(checkWindowService, 'getCheckWindowsAssignedToForms')
      sandbox.mock(checkFormService).expects('formatCheckFormsAndWindows').resolves(checkFormsFormattedMock)
      service = proxyquire('../../services/check-form.service', {
        '../../services/check-form.service': checkFormService,
        '../../services/data-access/check-form.data.service': checkFormDataService,
        '../../services/check-window.service': checkWindowService
      })
    })

    it('should return a formatted list of check forms and windows', async (done) => {
      checkFormDataServiceStub.resolves(checkFormsMock)
      checkWindowServiceStub.resolves(checkWindowsMock)
      const results = await service.formatCheckFormsAndWindows('name', 'asc')
      expect(results[0].name).toBe('MTC0100')
      expect(results[0].isDeleted).toBe(false)
      expect(results[0].questions.length).toBe(3)
      expect(results[0].removeLink).toBe(true)
      expect(results[0].checkWindows.length).toBe(0)
      done()
    })
  })

  describe('#unassignedCheckFormsFromCheckWindows()', () => {
    beforeEach(() => {
      service = proxyquire('../../services/check-form.service', {
        '../../services/check-form.service': checkFormService
      })
    })

    it('should return a promise', async (done) => {
      const result = await service.unassignedCheckFormsFromCheckWindows(checkWindowMock, checkWindowByForm)
      expect(checkWindowByForm[checkWindowMock._id].length).toBe(1)
      expect(result).toBeTruthy()
      done()
    })
  })

  describe('#checkWindowNames()', () => {
    it('should return a string value', (done) => {
      const formData = checkWindowByForm[29]
      const result = service.checkWindowNames(formData)
      expect(result.toString()).toBe(' Window Test 1')
      expect(result).toBeTruthy()
      done()
    })
  })

  describe('#canDelete()', () => {
    it('should return a boolean', (done) => {
      const formData = checkWindowByForm[29]
      const result = service.canDelete(formData)
      expect(result.toString()).toBe('false')
      expect(result).toBeFalsy()
      done()
    })
  })

  describe('#buildFormName()', () => {
    it('should return a valid form name', async (done) => {
      const result = await service.buildFormName('MTC0100.csv')
      expect(result).toBe('MTC0100')
      expect(result).toBeTruthy()
      done()
    })

    it('should return a false if the name is invalid', async (done) => {
      const result = await service.buildFormName('0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789.csv')
      expect(result).toBeFalsy()
      done()
    })
  })

  describe('#validateCheckFormName()', () => {
    describe('When the name is available', () => {
      const formName = 'MTC0100'
      beforeEach(() => {
        spyOn(checkFormDataService, 'findCheckFormByName').and.returnValue(false)
      })

      it('should return back the form name', async (done) => {
        const result = await service.validateCheckFormName(formName)
        expect(result).toBe(formName)
        expect(result).toBeTruthy()
        done()
      })
    })

    describe('When the form name is not available', () => {
      const formName = 'MTC0100'
      beforeEach(() => {
        spyOn(checkFormDataService, 'findCheckFormByName').and.returnValue(formName)
      })

      it('should return false', async (done) => {
        const result = await service.validateCheckFormName(formName)
        expect(result).toBeFalsy()
        done()
      })
    })
  })

  describe('#isRowCountValid()', () => {
    let csvFile

    describe('When the number of lines is valid', () => {
      beforeEach(() => {
        csvFile = 'data/fixtures/check-form-5.csv'
        spyOn(fs, 'readFileSync').and.returnValue(csvFile)
      })

      it('should return true', (done) => {
        const result = service.isRowCountValid(csvFile)
        expect(result).toBeTruthy()
        done()
      })
    })

    describe('When the number of lines is invalid', () => {
      beforeEach(() => {
        csvFile = 'data/fixtures/check-form-7.csv'
        spyOn(fs, 'readFileSync').and.returnValue(false)
      })

      it('should return false', (done) => {
        const result = service.isRowCountValid(csvFile)
        expect(result).toBeFalsy()
        done()
      })
    })
  })
})
