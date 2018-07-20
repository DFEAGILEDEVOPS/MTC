'use strict'

/* global describe, it, spyOn expect */

const moment = require('moment')
const checkWindowErrorMessages = require('../../../../../lib/errors/check-window')
const ValidationError = require('../../../../../lib/validation-error')
const checkWindowCheckStartDateValidator = require('../../../../../lib/validator/check-window/check-window-check-start-date-validator')

describe('Check window check start date validator', function () {
  describe('validate', function () {
    it('should not call addError method if the validation is successful', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const checkStartDateData = {
        checkStartDay: moment.utc().add(1, 'days').format('DD'),
        checkStartMonth: moment.utc().add(1, 'days').format('MM'),
        checkStartYear: moment.utc().add(1, 'days').format('YYYY')
      }
      checkWindowCheckStartDateValidator.validate(validationError, checkStartDateData)
      expect(validationError.addError).not.toHaveBeenCalled()
    })
    it('calls addError with checkStartDayRequired message if the check start day is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const checkStartDateData = {
        checkStartDay: '',
        checkStartMonth: moment.utc().add(1, 'days').format('MM'),
        checkStartYear: moment.utc().add(1, 'days').format('YYYY')
      }
      checkWindowCheckStartDateValidator.validate(validationError, checkStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('checkStartDay', checkWindowErrorMessages.checkStartDayRequired)
    })
    it('calls addError with checkStartDayWrongDay and checkStartDayInvalidChars messages if the check start day is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const checkStartDateData = {
        checkStartDay: 'on',
        checkStartMonth: moment.utc().add(1, 'days').format('MM'),
        checkStartYear: moment.utc().add(1, 'days').format('YYYY')
      }
      checkWindowCheckStartDateValidator.validate(validationError, checkStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('checkStartDay', checkWindowErrorMessages.checkStartDayWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('checkStartDay', checkWindowErrorMessages.checkStartDayInvalidChars)
    })
    it('calls addError with checkStartMonthRequired message if the check start month is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const checkStartDateData = {
        checkStartDay: moment.utc().add(1, 'days').format('DD'),
        checkStartMonth: '',
        checkStartYear: moment.utc().add(1, 'days').format('YYYY')
      }
      checkWindowCheckStartDateValidator.validate(validationError, checkStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('checkStartMonth', checkWindowErrorMessages.checkStartMonthRequired)
    })
    it('calls addError with checkStartMonthWrongDay and checkStartMonthInvalidChars messages if the check start month is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const checkStartDateData = {
        checkStartDay: moment.utc().add(1, 'days').format('DD'),
        checkStartMonth: 'tw',
        checkStartYear: moment.utc().add(1, 'days').format('YYYY')
      }
      checkWindowCheckStartDateValidator.validate(validationError, checkStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('checkStartMonth', checkWindowErrorMessages.checkStartMonthWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('checkStartMonth', checkWindowErrorMessages.checkStartMonthInvalidChars)
    })
    it('calls addError with checkStartYearRequired message if the check start year is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const checkStartDateData = {
        checkStartDay: moment.utc().add(1, 'days').format('DD'),
        checkStartMonth: moment.utc().add(1, 'days').format('MM'),
        checkStartYear: ''
      }
      checkWindowCheckStartDateValidator.validate(validationError, checkStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('checkStartYear', checkWindowErrorMessages.checkStartYearRequired)
    })
    it('calls addError with checkStartYearWrongDay and checkStartYearInvalidChars messages if the check start year is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const checkStartDateData = {
        checkStartDay: moment.utc().add(1, 'days').format('DD'),
        checkStartMonth: moment.utc().add(1, 'days').format('MM'),
        checkStartYear: 'th'
      }
      checkWindowCheckStartDateValidator.validate(validationError, checkStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('checkStartYear', checkWindowErrorMessages.checkStartYearWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('checkStartYear', checkWindowErrorMessages.checkStartYearInvalidChars)
    })
    it('calls addError with checkStartYearWrongDay and checkStartYearInvalidChars messages if the check start year is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const checkStartDateData = {
        checkStartDay: moment.utc().add(1, 'days').format('DD'),
        checkStartMonth: moment.utc().add(1, 'days').format('MM'),
        checkStartYear: moment.utc().add(1, 'days').format('YY')
      }
      checkWindowCheckStartDateValidator.validate(validationError, checkStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('checkStartYear', checkWindowErrorMessages.checkStartYearWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('checkStartYear', checkWindowErrorMessages.checkStartYearInvalidChars)
    })
    it('calls addError with checkStartYearWrongDay message if the check start year is in the past', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const checkStartDateData = {
        checkStartDay: moment.utc().add(1, 'days').format('DD'),
        checkStartMonth: moment.utc().add(1, 'days').format('MM'),
        checkStartYear: moment.utc().subtract(1, 'year').format('YYYY')
      }
      checkWindowCheckStartDateValidator.validate(validationError, checkStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('checkStartYear', checkWindowErrorMessages.checkStartYearWrongDay)
    })
  })
})
