'use strict'
/* global describe expect it fail spyOn */

const newCheckWindowAddService = require('../../../services/new-check-window-add.service')
const newCheckWindowAddValidator = require('../../../lib/validator/new-check-window/new-check-window-add-validator')
const ValidationError = require('../../../lib/validation-error')

describe('new-check-window-add.service', () => {
  describe('process', () => {
    it('should call validate', async () => {
      const validationError = new ValidationError()
      spyOn(newCheckWindowAddValidator, 'validate').and.returnValue(validationError)
      const requestData = {}
      try {
        await newCheckWindowAddService.process(requestData)
      } catch (error) {
        fail()
      }
      expect(newCheckWindowAddValidator.validate).toHaveBeenCalled()
    })
    it('should throw when a validation error exists', async () => {
      const validationError = new ValidationError()
      validationError.addError('errorField', true)
      spyOn(newCheckWindowAddValidator, 'validate').and.returnValue(validationError)
      const requestData = {}
      try {
        await newCheckWindowAddService.process(requestData)
        fail()
      } catch (error) {
        expect(error.name).toBe('ValidationError')
        expect(Object.keys(error.errors).length).toBe(1)
      }
      expect(newCheckWindowAddValidator.validate).toHaveBeenCalled()
    })
  })
})
