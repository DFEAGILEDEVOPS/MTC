'use strict'

/* global describe, it, spyOn expect */
const moment = require('moment')
const dateService = require('../../../../services/date.service')
const checkWindowEditValidator = require('../../../../lib/validator/check-window/check-window-edit-validator')

const checkWindowNameValidator = require('../../../../lib/validator/check-window/check-window-name-validator')
const checkWindowAdminStartDateValidator = require('../../../../lib/validator/check-window/check-window-admin-start-date-validator')
const checkWindowCheckStartDateValidator = require('../../../../lib/validator/check-window/check-window-check-start-date-validator')
const checkWindowCheckEndDateValidator = require('../../../../lib/validator/check-window/check-window-check-end-date-validator')

describe('Check window edit validator', function () {
  describe('validate', function () {
    it('returns validationError object with no errors if the validation is successful', () => {
      spyOn(checkWindowNameValidator, 'validate')
      spyOn(checkWindowAdminStartDateValidator, 'validate')
      spyOn(checkWindowCheckStartDateValidator, 'validate')
      spyOn(checkWindowCheckEndDateValidator, 'validate')
      spyOn(dateService, 'createUTCFromDayMonthYear').and.returnValues(
        moment.utc().add(1, 'days'),
        moment.utc().add(2, 'days'),
        moment.utc().add(3, 'days')
      )
      const existingCheckWindow = {
        adminStartDate: moment.utc().add(1, 'days'),
        checkStartDate: moment.utc().add(2, 'days')
      }
      const validationError = checkWindowEditValidator.validate({}, existingCheckWindow)
      expect(validationError.hasError()).toBeFalsy()
    })
    it('does not call checkWindowAdminStartDateValidator validate method if admin start date is in the past', () => {
      spyOn(checkWindowNameValidator, 'validate')
      spyOn(checkWindowAdminStartDateValidator, 'validate')
      spyOn(checkWindowCheckStartDateValidator, 'validate')
      spyOn(checkWindowCheckEndDateValidator, 'validate')
      spyOn(dateService, 'createUTCFromDayMonthYear').and.returnValues(
        moment.utc().add(1, 'days'),
        moment.utc().add(2, 'days'),
        moment.utc().add(3, 'days')
      )
      const existingCheckWindow = {
        adminStartDate: moment.utc().subtract(1, 'days').format('YYYY-MM-DD'),
        checkStartDate: moment.utc().add(2, 'days').format('YYYY-MM-DD')
      }
      const validationError = checkWindowEditValidator.validate({}, existingCheckWindow)
      expect(checkWindowAdminStartDateValidator.validate).not.toHaveBeenCalled()
      expect(Object.keys(validationError.errors).length).toBe(0)
    })
    it('does not call checkWindowCheckStartDateValidator validate method if check start date is in the past', () => {
      spyOn(checkWindowNameValidator, 'validate')
      spyOn(checkWindowAdminStartDateValidator, 'validate')
      spyOn(checkWindowCheckStartDateValidator, 'validate')
      spyOn(checkWindowCheckEndDateValidator, 'validate')
      spyOn(dateService, 'createUTCFromDayMonthYear').and.returnValues(
        moment.utc().add(1, 'days'),
        moment.utc().add(2, 'days'),
        moment.utc().add(3, 'days')
      )
      const existingCheckWindow = {
        adminStartDate: moment.utc().add(1, 'days').format('YYYY-MM-DD'),
        checkStartDate: moment.utc().subtract(2, 'days').format('YYYY-MM-DD')
      }
      const validationError = checkWindowEditValidator.validate({}, existingCheckWindow)
      expect(checkWindowCheckStartDateValidator.validate).not.toHaveBeenCalled()
      expect(Object.keys(validationError.errors).length).toBe(0)
    })
    it('returns adminDateInThePast validationError if the new admin date is in the past', () => {
      spyOn(checkWindowNameValidator, 'validate')
      spyOn(checkWindowAdminStartDateValidator, 'validate')
      spyOn(checkWindowCheckStartDateValidator, 'validate')
      spyOn(checkWindowCheckEndDateValidator, 'validate')
      spyOn(dateService, 'createUTCFromDayMonthYear').and.returnValues(
        moment.utc().subtract(1, 'days'),
        moment.utc().add(2, 'days'),
        moment.utc().add(3, 'days')
      )
      const existingCheckWindow = {
        adminStartDate: moment.utc().add(1, 'days'),
        checkStartDate: moment.utc().add(2, 'days')
      }
      const validationError = checkWindowEditValidator.validate({}, existingCheckWindow)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.adminDateInThePast).toBeTruthy()
    })
    it('returns checkStartDateInThePast validationError if the new check start date is in the past', () => {
      spyOn(checkWindowNameValidator, 'validate')
      spyOn(checkWindowAdminStartDateValidator, 'validate')
      spyOn(checkWindowCheckStartDateValidator, 'validate')
      spyOn(checkWindowCheckEndDateValidator, 'validate')
      spyOn(dateService, 'createUTCFromDayMonthYear').and.returnValues(
        moment.utc().add(1, 'days'),
        moment.utc().subtract(2, 'days'),
        moment.utc().add(3, 'days')
      )
      const existingCheckWindow = {
        adminStartDate: moment.utc().add(1, 'days'),
        checkStartDate: moment.utc().add(2, 'days')
      }
      const validationError = checkWindowEditValidator.validate({}, existingCheckWindow)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.checkStartDateInThePast).toBeTruthy()
    })
    it('returns checkEndDateInThePast validationError if the check end date is in the past', () => {
      spyOn(checkWindowNameValidator, 'validate')
      spyOn(checkWindowAdminStartDateValidator, 'validate')
      spyOn(checkWindowCheckStartDateValidator, 'validate')
      spyOn(checkWindowCheckEndDateValidator, 'validate')
      spyOn(dateService, 'createUTCFromDayMonthYear').and.returnValues(
        moment.utc().add(1, 'days'),
        moment.utc().add(2, 'days'),
        moment.utc().subtract(3, 'days')
      )
      const existingCheckWindow = {
        adminStartDate: moment.utc().add(1, 'days'),
        checkStartDate: moment.utc().add(2, 'days')
      }
      const validationError = checkWindowEditValidator.validate({}, existingCheckWindow)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.checkEndDateInThePast).toBeTruthy()
    })
    it('returns checkDateBeforeAdminDate validationError if the check start date is before admin start date', () => {
      spyOn(checkWindowNameValidator, 'validate')
      spyOn(checkWindowAdminStartDateValidator, 'validate')
      spyOn(checkWindowCheckStartDateValidator, 'validate')
      spyOn(checkWindowCheckEndDateValidator, 'validate')
      spyOn(dateService, 'createUTCFromDayMonthYear').and.returnValues(
        moment.utc().add(2, 'days'),
        moment.utc().add(1, 'days'),
        moment.utc().add(3, 'days')
      )
      const existingCheckWindow = {
        adminStartDate: moment.utc().add(1, 'days'),
        checkStartDate: moment.utc().add(2, 'days')
      }
      const validationError = checkWindowEditValidator.validate({}, existingCheckWindow)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.checkDateBeforeAdminDate).toBeTruthy()
    })
    it('returns checkStartDateAfterEndDate and checkEndDateBeforeStartDate validationError if the check start date is before admin start date', () => {
      spyOn(checkWindowNameValidator, 'validate')
      spyOn(checkWindowAdminStartDateValidator, 'validate')
      spyOn(checkWindowCheckStartDateValidator, 'validate')
      spyOn(checkWindowCheckEndDateValidator, 'validate')
      spyOn(dateService, 'createUTCFromDayMonthYear').and.returnValues(
        moment.utc().add(1, 'days'),
        moment.utc().add(3, 'days'),
        moment.utc().add(2, 'days')
      )
      const existingCheckWindow = {
        adminStartDate: moment.utc().add(1, 'days'),
        checkStartDate: moment.utc().add(2, 'days')
      }
      const validationError = checkWindowEditValidator.validate({}, existingCheckWindow)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.checkStartDateAfterEndDate).toBeTruthy()
      expect(validationError.errors.checkEndDateBeforeStartDate).toBeTruthy()
    })
  })
})
