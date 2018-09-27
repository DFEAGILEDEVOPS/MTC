'use strict'
/* global describe expect it fail spyOn */

const checkWindowV2AddService = require('../../../services/check-window-v2-add.service')
const checkWindowAddValidator = require('../../../lib/validator/check-window-v2/check-window-add-validator')
const ValidationError = require('../../../lib/validation-error')

describe('new-check-window-add.service', () => {
  describe('process', () => {
    it('should call validate', async () => {
      const validationError = new ValidationError()
      spyOn(checkWindowAddValidator, 'validate').and.returnValue(validationError)
      const requestData = {}
      try {
        await checkWindowV2AddService.process(requestData)
      } catch (error) {
        fail()
      }
      expect(checkWindowAddValidator.validate).toHaveBeenCalled()
    })
    it('should throw when a validation error exists', async () => {
      const validationError = new ValidationError()
      validationError.addError('errorField', true)
      spyOn(checkWindowAddValidator, 'validate').and.returnValue(validationError)
      const requestData = {}
      try {
        await checkWindowV2AddService.process(requestData)
        fail()
      } catch (error) {
        expect(error.name).toBe('ValidationError')
        expect(Object.keys(error.errors).length).toBe(1)
      }
      expect(checkWindowAddValidator.validate).toHaveBeenCalled()
    })
  })
})
