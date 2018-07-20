'use strict'
/**
 * @file Unit tests for check form service
 */
/* global describe xdescribe beforeEach it expect spyOn fail jasmine */

const fs = require('fs-extra')
const R = require('ramda')
const moment = require('moment')

const checkFormDataService = require('../../../services/data-access/check-form.data.service')
const checkWindowDataService = require('../../../services/data-access/check-window.data.service')
const random = require('../../../lib/random-generator')

const checkFormsMock = require('../mocks/check-forms')
const checkWindowByForm = require('../mocks/check-window-by-form')
const checkWindowMock = require('../mocks/check-window-2')

const checkFormMock = {
  id: 100,
  name: 'MTC0100',
  isDeleted: false,
  formData: '[ { "f1" : 2, "f2" : 5},{"f1" : 11, "f2" : 2    }]'
}

const resolve = (x) => Promise.resolve(x)
const reject = (x) => Promise.reject(x)

describe('check-form.service', () => {
  const service = require('../../../services/check-form.service')

  describe('#allocateCheckForm ', () => {
    const availableForms = [
      { id: 1, name: 'Form 1' },
      { id: 2, name: 'Form 2' },
      { id: 3, name: 'Form 3' }
    ]
    const seenForms = [ 2 ]

    it('it should return a check-form', async () => {
      try {
        const checkForm = await service.allocateCheckForm(availableForms, seenForms)
        expect(typeof checkForm).toBe('object')
        expect(checkForm.hasOwnProperty('id')).toBe(true)
        expect(checkForm.hasOwnProperty('name')).toBe(true)
      } catch (error) {
        fail(error)
      }
    })

    it('should throw when available form param is not an array', async () => {
      try {
        await service.allocateCheckForm({}, seenForms)
      } catch (error) {
        expect(error.message).toBe('availableForms is not an array')
      }
    })

    it('should throw when available form param is not an array', async () => {
      try {
        await service.allocateCheckForm(null, seenForms)
      } catch (error) {
        expect(error.message).toBe('availableForms is not an array')
      }
    })

    it('should throw when the used forms param is not an array', async () => {
      try {
        await service.allocateCheckForm(availableForms, undefined)
      } catch (error) {
        expect(error.message).toBe('usedFormIds is not an array')
      }
    })

    it('should throw when the used forms param is not an array', async () => {
      try {
        await service.allocateCheckForm(availableForms)
      } catch (error) {
        expect(error.message).toBe('usedFormIds is not an array')
      }
    })

    it('should throw when the available forms param is an empty array', async () => {
      try {
        await service.allocateCheckForm([], [])
      } catch (error) {
        expect(error.message).toBe('There must be at least one form to select')
      }
    })

    it('randomly selects a form if there are two or more unseen forms to choose', async () => {
      const f = await service.allocateCheckForm(availableForms, seenForms)
      expect(f.name).toMatch(/^Form (1|3)$/)
    })

    it('selects the last unseen form if there is only 1 unseen form to choose from', async () => {
      const f = await service.allocateCheckForm(availableForms, [2, 3])
      expect(f.name).toBe('Form 1') // the only unseen form in the available forms
    })

    it('randomly chooses a seen form if there are no unseen forms', async () => {
      const f = await service.allocateCheckForm(availableForms, [1, 2, 3])
      expect(f.name).toMatch(/^Form (1|2|3)$/)
    })

    it('selects the only seen form available when there is only one form provided', async () => {
      const f = await service.allocateCheckForm([{id: 1, name: 'Form 1'}], [1])
      expect(f.name).toBe('Form 1')
    })

    it('throws a meaningful error if the underlying library throws', async () => {
      spyOn(random, 'getRandomIntInRange').and.throwError('a mock throw')
      try {
        await service.allocateCheckForm(availableForms, seenForms)
      } catch (error) {
        expect(error.message).toBe('Error allocating checkForm: a mock throw')
      }
    })
  })

  describe('#prepareQuestionData()', () => {
    it('should prepare the question data', async () => {
      try {
        const questions = service.prepareQuestionData(JSON.parse(checkFormMock.formData))
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
    it('should return a valid form name', async () => {
      const result = await service.buildFormName('MTC0100.csv')
      expect(result).toBe('MTC0100')
      expect(result).toBeTruthy()
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

    it('should return a list of unassigned check forms ids', async () => {
      const existingAssignedForms = [101, 102]
      const result = await service.getUnassignedFormsForCheckWindow(existingAssignedForms)
      expect(result[0].id).toBe(100)
      expect(result[0].name).toBe('MTC0100')
      expect(result).toBeTruthy()
    })
  })

  describe('#getAssignedFormsForCheckWindow() - Get assigned forms for selected check window.', () => {
    beforeEach(() => {
      spyOn(checkFormDataService, 'sqlFetchSortedActiveFormsByName').and.returnValue(checkFormsMock) // Mock has ids 100, 101 and 102
    })

    it('should return a list of assigned check forms id', async () => {
      const result = await service.getAssignedFormsForCheckWindow(1)
      expect(result).toBeTruthy()
      expect(result.length).toBe(checkFormsMock.length)
    })
  })

  describe('getCheckFormsByIds', () => {
    it('throws an error if check form ids list is empty', async () => {
      try {
        await service.getCheckFormsByIds()
        fail()
      } catch (error) {
        expect(error.message).toBe('batchIds list empty or not defined')
      }
    })
    it('returns parsed check forms', async () => {
      spyOn(checkFormDataService, 'sqlFindByIds').and.returnValue([checkFormMock])
      const result = await service.getCheckFormsByIds([1])
      expect(typeof result[0].formData).toBe('object')
    })
  })

  describe('removeWindowAssignment', () => {
    it('throws an error if the checkForm ID is not found in the DB', async () => {
      spyOn(checkFormDataService, 'sqlFindOneById').and.returnValue(reject(new Error('mock error')))
      spyOn(checkWindowDataService, 'sqlFindOneById').and.returnValue(resolve(checkWindowMock))
      try {
        await service.removeWindowAssignment(1, 2)
        fail('should have thrown')
      } catch (error) {
        expect(error.message).toBe('mock error')
      }
    })

    it('throws an error if the checkWindow ID is not found in the DB', async () => {
      spyOn(checkFormDataService, 'sqlFindOneById').and.returnValue(resolve(checkFormMock))
      spyOn(checkWindowDataService, 'sqlFindOneById').and.returnValue(reject(new Error('mock error')))
      try {
        await service.removeWindowAssignment(1, 2)
        fail('should have thrown')
      } catch (error) {
        expect(error.message).toBe('mock error')
      }
    })

    it('throws an error if the checkWindow.checkStartDate has already passed', async () => {
      // Set up a checkWindow that started 1 day ago
      let today = moment('2018-06-02T09:00:00').toDate()
      const checkWindowMock2 = R.assoc('checkStartDate', moment('2018-06-01T12:15:30'), checkFormMock)
      jasmine.clock().mockDate(today)

      // mock out the db calls
      spyOn(checkFormDataService, 'sqlFindOneById').and.returnValue(resolve(checkFormMock))
      spyOn(checkWindowDataService, 'sqlFindOneById').and.returnValue(resolve(checkWindowMock2))

      try {
        await service.removeWindowAssignment(1, 2)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Forms cannot be unassigned from an active check window')
      }
      jasmine.clock().uninstall()
    })

    // happy path
    it('calls the data layer method to unassign forms', async () => {
      // For this to pass we want the checkStart date to be in the future
      checkWindowMock.checkStartDate = moment().add(2, 'weeks')

      // mock out the db calls
      spyOn(checkFormDataService, 'sqlFindOneById').and.returnValue(resolve(checkFormMock))
      spyOn(checkWindowDataService, 'sqlFindOneById').and.returnValue(resolve(checkWindowMock))
      spyOn(checkFormDataService, 'sqlRemoveWindowAssignment').and.returnValue(resolve({}))

      try {
        await service.removeWindowAssignment(1, 2)
        expect(checkFormDataService.sqlRemoveWindowAssignment).toHaveBeenCalledTimes(1)
      } catch (error) {
        fail(error)
      }
    })
  })
})
