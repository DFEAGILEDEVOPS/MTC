'use strict'
/* global describe xdescribe beforeEach afterEach it expect jasmine spyOn fail */

const fs = require('fs-extra')
const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')
const checkFormService = require('../../services/check-form.service')
const checkFormDataService = require('../../services/data-access/check-form.data.service')
const CheckForm = require('../../models/check-form')
const checkFormMock = {
  id: 100,
  name: 'MTC0100',
  isDeleted: false,
  formData: '[ { "f1" : 2, "f2" : 5},{"f1" : 11,"f2" : 2    }]'
}
const checkFormsMock = require('../mocks/check-forms')
const checkWindowMock = require('../mocks/check-window-2')
const checkWindowByForm = require('../mocks/check-window-by-form')

describe('check-form.service', () => {
  let service
  let sandbox

  beforeEach(() => { sandbox = sinon.sandbox.create() })
  afterEach(() => { sandbox.restore() })

  function setupService (cb) {
    return proxyquire('../../services/check-form.service', {
      '../services/data-access/check-form.data.service': {
        sqlFindActiveForm: jasmine.createSpy().and.callFake(cb),
        getActiveFormPlain: jasmine.createSpy().and.callFake(cb),
        findCheckFormByName: jasmine.createSpy().and.callFake(cb),
        isRowCountValid: jasmine.createSpy().and.callFake(cb)
      },
      '../models/check-form': CheckForm
    })
  }

  describe('#allocateCheckForm - Happy path', () => {
    beforeEach(() => {
      service = require('../../services/check-form.service')
      spyOn(checkFormDataService, 'sqlFindActiveForm').and.returnValue(Promise.resolve([checkFormMock]))
    })

    it('should return a check-form', async (done) => {
      try {
        const checkForm = await service.allocateCheckForm()
        expect(checkForm).toEqual(checkFormMock)
      } catch (error) {
        fail(error)
      }
      done()
    })

    describe('#prepareQuestionData()', () => {
      it('should prepare the question data', async (done) => {
        try {
          const checkForm = await service.allocateCheckForm()
          const questions = service.prepareQuestionData(JSON.parse(checkForm.formData))
          expect(Array.isArray(questions)).toBeTruthy()
          expect(questions.length).toBe(2)
          questions.forEach((q) => {
            expect(q.hasOwnProperty('order')).toBeTruthy()
            expect(q.hasOwnProperty('factor1')).toBeTruthy()
            expect(q.hasOwnProperty('factor2')).toBeTruthy()
          })
        } catch (error) {
          fail(error)
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
        fail('expected to throw')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe('CheckForm not found')
      }
      done()
    })
  })

  // TODO consider removal when moved to SQL as method under test is questionable
  xdescribe('#formatCheckFormsAndWindows()', () => {
    let checkFormDataServiceStub

    beforeEach(() => {
    })

    it('when sorting by form name it should call appropriate data service method', async (done) => {
      spyOn()
      const results = await service.formatCheckFormsAndWindows('name', 'asc')
      expect(checkFormDataServiceStub, 'sqlFetchSortedActiveFormsByName').toHaveBeenCalled()
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
      const formData = {
        id: 1,
        name: 'Window Test 1'
      }
      const result = service.checkWindowNames([formData])
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
        spyOn(checkFormDataService, 'sqlFindCheckFormByName').and.returnValue([])
      })

      it('should return true when form name not in use', async (done) => {
        const result = await service.validateCheckFormName(formName)
        expect(result).toBe(true)
        done()
      })
    })

    describe('When the form name is not available', () => {
      const formName = 'MTC0100'
      beforeEach(() => {
        spyOn(checkFormDataService, 'sqlFindCheckFormByName').and.returnValue(formName)
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

  describe('#getUnassignedFormsForCheckWindow() - Get unassigned forms for selected check window.', () => {
    beforeEach(() => {
      spyOn(checkFormDataService, 'sqlFetchSortedActiveFormsNotAssignedToWindowByName').and.returnValue(checkFormsMock) // Mock has ids 100, 101 and 102
    })

    it('should return a list of unassigned check forms ids', async (done) => {
      const existingAssignedForms = [101, 102]
      const result = await service.getUnassignedFormsForCheckWindow(existingAssignedForms)
      expect(result[0]._id).toBe(100)
      expect(result[0].name).toBe('MTC0100')
      expect(result).toBeTruthy()
      done()
    })
  })

  describe('#getAssignedFormsForCheckWindow() - Get assigned forms for selected check window.', () => {
    beforeEach(() => {
      spyOn(checkFormDataService, 'sqlFetchSortedActiveFormsByName').and.returnValue(checkFormsMock) // Mock has ids 100, 101 and 102
    })

    it('should return a list of assigned check forms id', async (done) => {
      const result = await service.getAssignedFormsForCheckWindow(1)
      expect(result).toBeTruthy()
      expect(result.length).toBe(checkFormsMock.length)
      done()
    })
  })
})
