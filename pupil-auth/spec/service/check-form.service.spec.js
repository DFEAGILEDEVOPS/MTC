'use strict'
/**
 * @file Unit tests for check form service
 */
/* global describe xdescribe beforeEach it expect spyOn fail */

const fs = require('fs-extra')

const checkFormDataService = require('../../services/data-access/check-form.data.service')
const random = require('../../lib/random-generator')

const checkFormsMock = require('../mocks/check-forms')
const checkWindowByForm = require('../mocks/check-window-by-form')
const checkWindowMock = require('../mocks/check-window-2')

const checkFormMock = {
  id: 100,
  name: 'MTC0100',
  isDeleted: false,
  formData: '[ { "f1" : 2, "f2" : 5},{"f1" : 11, "f2" : 2    }]'
}

describe('check-form.service', () => {
  const service = require('../../services/check-form.service')

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
})
