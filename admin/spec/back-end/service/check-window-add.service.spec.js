'use strict'
/* global describe expect it fail spyOn */

const checkWindowAddService = require('../../../services/check-window-add.service')
const checkWindowAddValidator = require('../../../lib/validator/check-window/check-window-add-validator')
const checkWindowService = require('../../../services/check-window.service')
const ValidationError = require('../../../lib/validation-error')

describe('check-window-add.service', () => {
  describe('process', () => {
    it('should call submit if no validation error is thrown', async () => {
      const validationError = new ValidationError()
      spyOn(checkWindowService, 'submit')
      spyOn(checkWindowAddValidator, 'validate').and.returnValue(validationError)
      const requestData = {}
      try {
        await checkWindowAddService.process(requestData)
      } catch (error) {
        fail()
      }
      expect(checkWindowService.submit).toHaveBeenCalled()
    })
    it('should throw when a validation error exists', async () => {
      const validationError = new ValidationError()
      validationError.addError('errorField', true)
      spyOn(checkWindowService, 'submit')
      spyOn(checkWindowAddValidator, 'validate').and.returnValue(validationError)
      const requestData = {}
      try {
        await checkWindowAddService.process(requestData)
        fail()
      } catch (error) {
        expect(error.name).toBe('ValidationError')
        expect(Object.keys(error.errors).length).toBe(1)
      }
      expect(checkWindowService.submit).not.toHaveBeenCalled()
    })
  })
})
