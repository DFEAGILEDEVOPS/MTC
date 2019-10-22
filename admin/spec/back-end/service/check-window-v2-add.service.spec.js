'use strict'
/* global describe beforeEach expect it fail spyOn */

const activeCheckWindowValidator = require('../../../lib/validator/check-window-v2/active-check-window-validator')
const checkWindowDataService = require('../../../services/data-access/check-window.data.service')
const checkWindowAddValidator = require('../../../lib/validator/check-window-v2/check-window-add-validator')
const checkWindowV2AddService = require('../../../services/check-window-v2-add.service')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const ValidationError = require('../../../lib/validation-error')

describe('check-window-v2-add.service', () => {
  describe('submit', () => {
    beforeEach(() => {
      spyOn(checkWindowDataService, 'sqlFindActiveCheckWindow')
    })
    it('when validation is successful should process data and perform db insertion', async () => {
      const validationError = new ValidationError()
      spyOn(checkWindowAddValidator, 'validate').and.returnValue(validationError)
      spyOn(checkWindowV2Service, 'prepareSubmissionData').and.returnValue({ name: 'Check window' })
      spyOn(activeCheckWindowValidator, 'validate').and.returnValue(validationError)
      spyOn(checkWindowDataService, 'sqlCreate')
      const requestData = {}
      try {
        await checkWindowV2AddService.submit(requestData)
      } catch (error) {
        fail()
      }
      expect(checkWindowAddValidator.validate).toHaveBeenCalled()
      expect(checkWindowV2Service.prepareSubmissionData).toHaveBeenCalled()
      expect(activeCheckWindowValidator.validate).toHaveBeenCalled()
      expect(checkWindowDataService.sqlCreate).toHaveBeenCalled()
    })
    it('when checkWindowAddValidator validation is unsuccessful should throw a validation error', async () => {
      const validationError = new ValidationError()
      validationError.addError('errorField', true)
      spyOn(checkWindowAddValidator, 'validate').and.returnValue(validationError)
      spyOn(checkWindowV2Service, 'prepareSubmissionData')
      spyOn(activeCheckWindowValidator, 'validate').and.returnValue(validationError)
      spyOn(checkWindowDataService, 'sqlCreate')
      const requestData = {}
      try {
        await checkWindowV2AddService.submit(requestData)
        fail()
      } catch (error) {
        expect(error.name).toBe('ValidationError')
        expect(Object.keys(error.errors).length).toBe(1)
      }
      expect(checkWindowAddValidator.validate).toHaveBeenCalled()
      expect(checkWindowV2Service.prepareSubmissionData).not.toHaveBeenCalled()
      expect(checkWindowDataService.sqlCreate).not.toHaveBeenCalled()
    })
    it('when checkWindowAddValidator validation is unsuccessful should not proceed with active check window validation', async () => {
      const validationError = new ValidationError()
      validationError.addError('errorField', true)
      spyOn(checkWindowAddValidator, 'validate').and.returnValue(validationError)
      spyOn(checkWindowV2Service, 'prepareSubmissionData')
      spyOn(activeCheckWindowValidator, 'validate').and.returnValue(validationError)
      spyOn(checkWindowDataService, 'sqlCreate')
      const requestData = {}
      try {
        await checkWindowV2AddService.submit(requestData)
        fail()
      } catch (error) {
        expect(error.name).toBe('ValidationError')
        expect(Object.keys(error.errors).length).toBe(1)
      }
      expect(activeCheckWindowValidator.validate).not.toHaveBeenCalled()
    })
    it('when activeCheckWindowValidator validation is unsuccessful should throw a validation error and prevent sqlCreate call', async () => {
      const validationError1 = new ValidationError()
      const validationError2 = new ValidationError()
      spyOn(checkWindowAddValidator, 'validate').and.returnValue(validationError1)
      spyOn(checkWindowV2Service, 'prepareSubmissionData')
      validationError2.addError('errorField', true)
      spyOn(activeCheckWindowValidator, 'validate').and.returnValue(validationError2)
      spyOn(checkWindowDataService, 'sqlCreate')
      const requestData = {}
      try {
        await checkWindowV2AddService.submit(requestData)
        fail()
      } catch (error) {
        expect(error.name).toBe('ValidationError')
        expect(Object.keys(error.errors).length).toBe(1)
      }
      expect(activeCheckWindowValidator.validate).toHaveBeenCalled()
      expect(checkWindowDataService.sqlCreate).not.toHaveBeenCalled()
    })
  })
})
