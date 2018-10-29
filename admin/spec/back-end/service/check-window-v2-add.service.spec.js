'use strict'
/* global describe beforeEach expect it fail spyOn */

const checkWindowDataService = require('../../../services/data-access/check-window.data.service')
const checkWindowAddValidator = require('../../../lib/validator/check-window-v2/check-window-add-validator')
const checkWindowV2AddService = require('../../../services/check-window-v2-add.service')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const ValidationError = require('../../../lib/validation-error')

describe('check-window-v2-add.service', () => {
  describe('submit', () => {
    describe('when validation is successful', () => {
      beforeEach(() => {
        const validationError = new ValidationError()
        spyOn(checkWindowAddValidator, 'validate').and.returnValue(validationError)
        spyOn(checkWindowV2Service, 'prepareSubmissionData').and.returnValue({ name: 'Check window' })
        spyOn(checkWindowDataService, 'sqlCreate')
      })
      it('should process data and perform db insertion', async () => {
        const requestData = {}
        try {
          await checkWindowV2AddService.submit(requestData)
        } catch (error) {
          fail()
        }
        expect(checkWindowAddValidator.validate).toHaveBeenCalled()
        expect(checkWindowV2Service.prepareSubmissionData).toHaveBeenCalled()
        expect(checkWindowDataService.sqlCreate).toHaveBeenCalled()
      })
    })
    describe('when validation is unsuccessful', () => {
      beforeEach(() => {
        const validationError = new ValidationError()
        validationError.addError('errorField', true)
        spyOn(checkWindowAddValidator, 'validate').and.returnValue(validationError)
        spyOn(checkWindowV2Service, 'prepareSubmissionData')
        spyOn(checkWindowDataService, 'sqlCreate')
      })
      it('should throw the validation error back to the caller', async () => {
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
    })
  })
})
