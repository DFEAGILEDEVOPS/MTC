'use strict'
/**
 * @file Unit tests for check form service
 */
/* global describe beforeEach it expect spyOn fail */

const fs = require('fs-extra')
const checkFormDataService = require('../../../services/data-access/check-form.data.service')
const random = require('../../../lib/random-generator')

const checkFormsMock = require('../mocks/check-forms')
const checkWindowByForm = require('../mocks/check-window-by-form')

const checkFormMock = {
  id: 100,
  name: 'MTC0100',
  isDeleted: false,
  formData: '[ { "f1" : 2, "f2" : 5},{"f1" : 11, "f2" : 2    }]'
}

describe('check-form.service', () => {
  const service = require('../../../services/check-form.service')

  describe('#allocateCheckForm ', () => {
    const availableForms = [
      { id: 1, name: 'Form 1' },
      { id: 2, name: 'Form 2' },
      { id: 3, name: 'Form 3' }
    ]
    const seenForms = [2]

    it('it should return a check-form', async () => {
      try {
        const checkForm = await service.allocateCheckForm(availableForms, seenForms)
        expect(typeof checkForm).toBe('object')
        expect({}.hasOwnProperty.call(checkForm, 'id')).toBe(true)
        expect({}.hasOwnProperty.call(checkForm, 'name')).toBe(true)
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
      const f = await service.allocateCheckForm([{ id: 1, name: 'Form 1' }], [1])
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
          expect({}.hasOwnProperty.call(q, 'order')).toBeTruthy()
          expect({}.hasOwnProperty.call(q, 'factor1')).toBeTruthy()
          expect({}.hasOwnProperty.call(q, 'factor2')).toBeTruthy()
        })
      } catch (error) {
        fail(error)
      }
    })
  })

  describe('#checkWindowNames()', () => {
    it('should return a string value', () => {
      const formData = {
        id: 1,
        name: 'Window Test 1'
      }
      const result = service.checkWindowNames([formData])
      expect(result.toString()).toBe(' Window Test 1')
      expect(result).toBeTruthy()
    })
  })

  describe('#canDelete()', () => {
    it('should return a boolean', () => {
      const formData = checkWindowByForm[29]
      const result = service.canDelete(formData)
      expect(result.toString()).toBe('false')
      expect(result).toBeFalsy()
    })
  })

  describe('#buildFormName()', () => {
    it('should return a valid form name', async () => {
      const result = await service.buildFormName('MTC0100.csv')
      expect(result).toBe('MTC0100')
      expect(result).toBeTruthy()
    })

    it('should return a false if the name is invalid', async () => {
      const result = await service.buildFormName('0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789.csv')
      expect(result).toBeFalsy()
    })
  })

  describe('#validateCheckFormName()', () => {
    describe('When the name is available', () => {
      const formName = 'MTC0100'
      beforeEach(() => {
        spyOn(checkFormDataService, 'sqlFindCheckFormByName').and.returnValue([])
      })

      it('should return true when form name not in use', async () => {
        const result = await service.validateCheckFormName(formName)
        expect(result).toBe(true)
      })
    })

    describe('When the form name is not available', () => {
      const formName = 'MTC0100'
      beforeEach(() => {
        spyOn(checkFormDataService, 'sqlFindCheckFormByName').and.returnValue(formName)
      })

      it('should return false', async () => {
        const result = await service.validateCheckFormName(formName)
        expect(result).toBeFalsy()
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

      it('should return true', () => {
        const result = service.isRowCountValid(csvFile)
        expect(result).toBeTruthy()
      })
    })

    describe('When the number of lines is invalid', () => {
      beforeEach(() => {
        csvFile = 'data/fixtures/check-form-7.csv'
        spyOn(fs, 'readFileSync').and.returnValue(false)
      })

      it('should return false', () => {
        const result = service.isRowCountValid(csvFile)
        expect(result).toBeFalsy()
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
})
