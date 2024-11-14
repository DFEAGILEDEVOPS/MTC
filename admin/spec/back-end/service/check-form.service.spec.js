'use strict'
/**
 * @file Unit tests for check form service
 */

const random = require('../../../lib/random-generator')

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

    test('it should return a check-form', async () => {
      const checkForm = await service.allocateCheckForm(availableForms, seenForms)
      expect(typeof checkForm).toBe('object')
      expect({}.hasOwnProperty.call(checkForm, 'id')).toBe(true)
      expect({}.hasOwnProperty.call(checkForm, 'name')).toBe(true)
    })

    test('should throw when available form param is not an array', async () => {
      await expect(service.allocateCheckForm({}, seenForms))
        .rejects
        .toThrow('availableForms is not an array')
    })

    test('should throw when available form param is not an array', async () => {
      await expect(service.allocateCheckForm(null, seenForms))
        .rejects
        .toThrow('availableForms is not an array')
    })

    test('should throw when the used forms param is not an array', async () => {
      await expect(service.allocateCheckForm(availableForms, undefined))
        .rejects
        .toThrow('usedFormIds is not an array')
    })

    test('should throw when the used forms param is not an array', async () => {
      await expect(service.allocateCheckForm(availableForms))
        .rejects
        .toThrow('usedFormIds is not an array')
    })

    test('should throw when the available forms param is an empty array', async () => {
      await expect(service.allocateCheckForm([], []))
        .rejects
        .toThrow('There must be at least one form to select')
    })

    test('randomly selects a form if there are two or more unseen forms to choose', async () => {
      const f = await service.allocateCheckForm(availableForms, seenForms)
      expect(f.name).toMatch(/^Form (1|3)$/)
    })

    test('selects the last unseen form if there is only 1 unseen form to choose from', async () => {
      const f = await service.allocateCheckForm(availableForms, [2, 3])
      expect(f.name).toBe('Form 1') // the only unseen form in the available forms
    })

    test('randomly chooses a seen form if there are no unseen forms', async () => {
      const f = await service.allocateCheckForm(availableForms, [1, 2, 3])
      expect(f.name).toMatch(/^Form (1|2|3)$/)
    })

    test('selects the only seen form available when there is only one form provided', async () => {
      const f = await service.allocateCheckForm([{ id: 1, name: 'Form 1' }], [1])
      expect(f.name).toBe('Form 1')
    })

    test('throws a meaningful error if the underlying library throws', async () => {
      jest.spyOn(random, 'getRandomIntInRange').mockRejectedValue(new Error('a mock throw'))
      await expect(service.allocateCheckForm(availableForms, seenForms))
        .rejects
        .toThrow('Error allocating checkForm: a mock throw')
    })
  })

  describe('#prepareQuestionData()', () => {
    test('should prepare the question data', async () => {
      const questions = service.prepareQuestionData(JSON.parse(checkFormMock.formData))
      expect(Array.isArray(questions)).toBeTruthy()
      expect(questions.length).toBe(2)
      questions.forEach((q) => {
        expect({}.hasOwnProperty.call(q, 'order')).toBeTruthy()
        expect({}.hasOwnProperty.call(q, 'factor1')).toBeTruthy()
        expect({}.hasOwnProperty.call(q, 'factor2')).toBeTruthy()
      })
    })
  })
})
