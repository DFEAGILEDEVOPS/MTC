'use strict'

const moment = require('moment-timezone')
const checkWindowErrorMessages = require('../../../../../lib/errors/check-window-v2')

const activeCheckWindowValidator = require('../../../../../lib/validator/check-window-v2/active-check-window-validator')

const activeCheckWindow = {
  id: 1,
  urlSlug: 'abc',
  adminStartDate: moment.utc().subtract(4, 'days'),
  adminEndDate: moment.utc().add(10, 'days'),
  familiarisationCheckStartDate: moment.utc().subtract(2, 'days'),
  familiarisationCheckEndDate: moment.utc().add(5, 'days'),
  checkStartDate: moment.utc().subtract(1, 'days'),
  checkEndDate: moment.utc().add(5, 'days')
}

describe('Active check window validator', function () {
  test('returns no errors if no active check window is found', () => {
    const requestData = {}
    const validationError = activeCheckWindowValidator.validate(requestData, {})
    expect(validationError.hasError()).toBeFalsy()
  })
  test('returns a validation error if a date is found in between the administration period', () => {
    const requestData = {
      adminStartDate: moment.utc().subtract(3, 'days'),
      adminEndDate: moment.utc().add(6, 'days'),
      familiarisationCheckStartDate: moment.utc().subtract(2, 'days'),
      familiarisationCheckEndDate: moment.utc().add(4, 'days'),
      checkStartDate: moment.utc().subtract(1, 'days'),
      checkEndDate: moment.utc().add(4, 'days')
    }
    const validationError = activeCheckWindowValidator.validate(requestData, activeCheckWindow)
    expect(validationError.errors.withinActiveCheckWindowAdminDateRage).toBe(checkWindowErrorMessages.withinActiveCheckWindowAdminDateRage)
  })
  test('returns a validation error if a date is found in between the try-out period', () => {
    const requestData = {
      adminStartDate: moment.utc().subtract(3, 'days'),
      adminEndDate: moment.utc().add(6, 'days'),
      familiarisationCheckStartDate: moment.utc().subtract(2, 'days'),
      familiarisationCheckEndDate: moment.utc().add(4, 'days'),
      checkStartDate: moment.utc().subtract(1, 'days'),
      checkEndDate: moment.utc().add(4, 'days')
    }
    const validationError = activeCheckWindowValidator.validate(requestData, activeCheckWindow)
    expect(validationError.errors.withinActiveCheckWindowFamiliarisationDateRage).toBe(checkWindowErrorMessages.withinActiveCheckWindowFamiliarisationDateRage)
  })
  test('returns a validation error if a date is found in between the live period', () => {
    const requestData = {
      adminStartDate: moment.utc().subtract(3, 'days'),
      adminEndDate: moment.utc().add(6, 'days'),
      familiarisationCheckStartDate: moment.utc().subtract(2, 'days'),
      familiarisationCheckEndDate: moment.utc().add(4, 'days'),
      checkStartDate: moment.utc().subtract(1, 'days'),
      checkEndDate: moment.utc().add(4, 'days')
    }
    const validationError = activeCheckWindowValidator.validate(requestData, activeCheckWindow)
    expect(validationError.errors.withinActiveCheckWindowLiveDateRage).toBe(checkWindowErrorMessages.withinActiveCheckWindowLiveDateRage)
  })
  test('returns no validation error if the request admin start date matches the active check window admin end date', () => {
    const requestData = {
      adminStartDate: moment.utc().add(10, 'days'),
      adminEndDate: moment.utc().add(20, 'days'),
      familiarisationCheckStartDate: moment.utc().add(12, 'days'),
      familiarisationCheckEndDate: moment.utc().add(16, 'days'),
      checkStartDate: moment.utc().add(13, 'days'),
      checkEndDate: moment.utc().add(16, 'days')
    }
    const validationError = activeCheckWindowValidator.validate(requestData, activeCheckWindow)
    expect(validationError.hasError()).toBeFalsy()
  })
  test('returns no validation error if active check window urlSlug matches the requestData urlSlug', () => {
    const requestData = {
      adminStartDate: moment.utc().add(10, 'days'),
      adminEndDate: moment.utc().add(20, 'days'),
      familiarisationCheckStartDate: moment.utc().add(12, 'days'),
      familiarisationCheckEndDate: moment.utc().add(16, 'days'),
      checkStartDate: moment.utc().add(13, 'days'),
      checkEndDate: moment.utc().add(16, 'days')
    }
    const urlSlug = 'abc'
    const validationError = activeCheckWindowValidator.validate(requestData, activeCheckWindow, urlSlug)
    expect(validationError.hasError()).toBeFalsy()
  })
})
