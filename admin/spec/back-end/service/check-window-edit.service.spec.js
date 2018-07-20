'use strict'
/* global describe expect it fail spyOn */

const checkWindowEditService = require('../../../services/check-window-edit.service')
const checkWindowEditValidator = require('../../../lib/validator/check-window/check-window-edit-validator')
const checkWindowService = require('../../../services/check-window.service')
const checkWindowDataService = require('../../../services/data-access/check-window.data.service')
const ValidationError = require('../../../lib/validation-error')

describe('check-window-edit.service', () => {
  describe('process', () => {
    it('should call submit if no validation error is thrown', async () => {
      const validationError = new ValidationError()
      spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug')
      spyOn(checkWindowService, 'submit')
      spyOn(checkWindowEditValidator, 'validate').and.returnValue(validationError)
      const requestData = {}
      try {
        await checkWindowEditService.process(requestData)
      } catch (error) {
        fail()
      }
      expect(checkWindowService.submit).toHaveBeenCalled()
    })
    it('should throw when a validation error exists', async () => {
      const validationError = new ValidationError()
      validationError.addError('errorField', true)
      spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug').and.returnValue({ id: 1 })
      spyOn(checkWindowService, 'submit')
      spyOn(checkWindowEditValidator, 'validate').and.returnValue(validationError)
      const requestData = {}
      try {
        await checkWindowEditService.process(requestData)
        fail()
      } catch (error) {
        expect(error.name).toBe('ValidationError')
        expect(Object.keys(error.errors).length).toBe(1)
      }
      expect(checkWindowService.submit).not.toHaveBeenCalled()
    })
  })
})
