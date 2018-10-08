'use strict'
/* global describe beforeEach expect it fail spyOn */

const moment = require('moment')

const checkWindowDataService = require('../../../services/data-access/check-window.data.service')
const checkWindowAddValidator = require('../../../lib/validator/check-window-v2/check-window-add-validator')
const checkWindowV2AddService = require('../../../services/check-window-v2-add.service')
const dateService = require('../../../services/date.service')
const ValidationError = require('../../../lib/validation-error')

describe('check-window-v2-add.service', () => {
  describe('submit', () => {
    describe('when validation is successful', () => {
      beforeEach(() => {
        const validationError = new ValidationError()
        spyOn(checkWindowAddValidator, 'validate').and.returnValue(validationError)
        spyOn(checkWindowV2AddService, 'processData').and.returnValue({ name: 'Check window' })
        spyOn(checkWindowDataService, 'sqlCreate')
      })
      it('should process data, perform db insertion and return a flash message', async () => {
        const requestData = {}
        let flashMessage
        try {
          flashMessage = await checkWindowV2AddService.submit(requestData)
        } catch (error) {
          fail()
        }
        expect(checkWindowAddValidator.validate).toHaveBeenCalled()
        expect(checkWindowV2AddService.processData).toHaveBeenCalled()
        expect(checkWindowDataService.sqlCreate).toHaveBeenCalled()
        expect(flashMessage).toBe('Check window has been created')
      })
    })
    describe('when validation is unsuccessful', () => {
      beforeEach(() => {
        const validationError = new ValidationError()
        validationError.addError('errorField', true)
        spyOn(checkWindowAddValidator, 'validate').and.returnValue(validationError)
        spyOn(checkWindowV2AddService, 'processData')
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
        expect(checkWindowV2AddService.processData).not.toHaveBeenCalled()
        expect(checkWindowDataService.sqlCreate).not.toHaveBeenCalled()
      })
    })
  })
  describe('processData', () => {
    it('should process check window data and return a db suitable format', async () => {
      spyOn(dateService, 'createUTCFromDayMonthYear').and.returnValue(moment.utc())
      const requestData = { checkWindowName: 'Check window' }
      const checkWindowData = checkWindowV2AddService.processData(requestData)
      expect(Object.keys(checkWindowData).length).toBe(7)
      expect(checkWindowData.adminStartDate).toBeDefined()
      expect(checkWindowData.adminEndDate).toBeDefined()
      expect(checkWindowData.familiarisationCheckStartDate).toBeDefined()
      expect(checkWindowData.familiarisationCheckEndDate).toBeDefined()
      expect(checkWindowData.checkStartDate).toBeDefined()
      expect(checkWindowData.checkEndDate).toBeDefined()
      expect(dateService.createUTCFromDayMonthYear).toHaveBeenCalledTimes(6)
      expect(checkWindowData.checkEndDate.format('HH:mm:ss')).toBe('22:59:59')
      expect(checkWindowData.familiarisationCheckEndDate.format('HH:mm:ss')).toBe('22:59:59')
    })
  })
})
