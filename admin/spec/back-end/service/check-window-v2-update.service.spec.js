'use strict'
/* global describe beforeEach expect it fail spyOn */

const moment = require('moment')
const uuid = require('uuid/v4')

const checkWindowDataService = require('../../../services/data-access/check-window.data.service')
const checkWindowAddValidator = require('../../../lib/validator/check-window-v2/check-window-add-validator')
const checkWindowV2UpdateService = require('../../../services/check-window-v2-update.service')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const ValidationError = require('../../../lib/validation-error')

describe('check-window-v2-update.service', () => {
  describe('submit', () => {
    describe('when validation is successful', () => {
      beforeEach(() => {
        const validationError = new ValidationError()
        spyOn(checkWindowAddValidator, 'validate').and.returnValue(validationError)
        spyOn(checkWindowV2Service, 'prepareSubmissionData').and.returnValue({ name: 'Check window' })
        spyOn(checkWindowDataService, 'sqlUpdate')
        spyOn(checkWindowV2UpdateService, 'getValidationConfig')
        spyOn(checkWindowV2Service, 'getCheckWindow').and.returnValue({ id: 1, checkWindowUrlSlug: uuid() })
      })
      it('should process data and perform db insertion', async () => {
        const requestData = {}
        try {
          await checkWindowV2UpdateService.submit(requestData)
        } catch (error) {
          fail()
        }
        expect(checkWindowAddValidator.validate).toHaveBeenCalled()
        expect(checkWindowV2UpdateService.getValidationConfig).toHaveBeenCalled()
        expect(checkWindowV2Service.prepareSubmissionData).toHaveBeenCalled()
        expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
        expect(checkWindowDataService.sqlUpdate).toHaveBeenCalled()
      })
    })
    describe('when validation is unsuccessful', () => {
      beforeEach(() => {
        const validationError = new ValidationError()
        validationError.addError('errorField', true)
        spyOn(checkWindowAddValidator, 'validate').and.returnValue(validationError)
        spyOn(checkWindowV2Service, 'prepareSubmissionData')
        spyOn(checkWindowV2UpdateService, 'getValidationConfig')
        spyOn(checkWindowDataService, 'sqlUpdate')
        spyOn(checkWindowV2Service, 'getCheckWindow')
      })
      it('should throw the validation error back to the caller', async () => {
        const requestData = {}
        try {
          await checkWindowV2UpdateService.submit(requestData)
          fail()
        } catch (error) {
          expect(error.name).toBe('ValidationError')
          expect(Object.keys(error.errors).length).toBe(1)
        }
        expect(checkWindowAddValidator.validate).toHaveBeenCalled()
        expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
        expect(checkWindowV2UpdateService.getValidationConfig).toHaveBeenCalled()
        expect(checkWindowV2Service.prepareSubmissionData).not.toHaveBeenCalled()
        expect(checkWindowDataService.sqlUpdate).not.toHaveBeenCalled()
      })
    })
  })
  describe('getValidationConfig', () => {
    it('should return no disabled attributes if all dates are in the future back to the caller', () => {
      const checkWindow = {
        adminStartDate: moment.utc().add(1, 'days'),
        adminEndDate: moment.utc().add(10, 'days'),
        familiarisationCheckStartDate: moment.utc().add(2, 'days'),
        familiarisationCheckEndDate: moment.utc().add(4, 'days'),
        checkStartDate: moment.utc().add(3, 'days'),
        checkEndDate: moment.utc().add(4, 'days')
      }
      const result = checkWindowV2UpdateService.getValidationConfig(checkWindow)
      const config = {
        adminStartDateDisabled: false,
        adminEndDateDisabled: false,
        familiarisationCheckStartDateDisabled: false,
        familiarisationCheckEndDateDisabled: false,
        liveCheckStartDateDisabled: false,
        liveCheckEndDateDisabled: false
      }
      expect(result).toEqual(config)
    })
    it('should return a disabled attribute if it is in the past back to the caller', () => {
      const checkWindow = {
        adminStartDate: moment.utc().subtract(1, 'days'),
        adminEndDate: moment.utc().add(10, 'days'),
        familiarisationCheckStartDate: moment.utc().add(2, 'days'),
        familiarisationCheckEndDate: moment.utc().add(4, 'days'),
        checkStartDate: moment.utc().add(3, 'days'),
        checkEndDate: moment.utc().add(4, 'days')
      }
      const result = checkWindowV2UpdateService.getValidationConfig(checkWindow)
      const config = {
        adminStartDateDisabled: true,
        adminEndDateDisabled: false,
        familiarisationCheckStartDateDisabled: false,
        familiarisationCheckEndDateDisabled: false,
        liveCheckStartDateDisabled: false,
        liveCheckEndDateDisabled: false
      }
      expect(result).toEqual(config)
    })
  })
})
