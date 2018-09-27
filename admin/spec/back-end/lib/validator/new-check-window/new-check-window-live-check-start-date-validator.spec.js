'use strict'

/* global describe, it, spyOn expect */

const moment = require('moment')
const checkWindowErrorMessages = require('../../../../../lib/errors/new-check-window')
const ValidationError = require('../../../../../lib/validation-error')
const newCheckWindowLiveCheckStartDateValidator = require('../../../../../lib/validator/new-check-window/new-check-window-live-check-start-date-validator')

describe('New check window live check start date validator', function () {
  describe('validate', function () {
    it('should not call addError method if the validation is successful', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const liveCheckStartDateData = {
        liveCheckStartDay: moment.utc().add(1, 'days').format('DD'),
        liveCheckStartMonth: moment.utc().add(1, 'days').format('MM'),
        liveCheckStartYear: moment.utc().add(1, 'days').format('YYYY')
      }
      newCheckWindowLiveCheckStartDateValidator.validate(validationError, liveCheckStartDateData)
      expect(validationError.addError).not.toHaveBeenCalled()
    })
    it('calls addError with liveCheckStartDayRequired message if the live check start day is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const liveCheckStartDateData = {
        liveCheckStartDay: '',
        liveCheckStartMonth: moment.utc().add(1, 'days').format('MM'),
        liveCheckStartYear: moment.utc().add(1, 'days').format('YYYY')
      }
      newCheckWindowLiveCheckStartDateValidator.validate(validationError, liveCheckStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckStartDay', checkWindowErrorMessages.liveCheckStartDayRequired)
    })
    it('calls addError with liveCheckStartDayWrongDay and liveCheckStartDayInvalidChars messages if the live check start day is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const liveCheckStartDateData = {
        liveCheckStartDay: 'on',
        liveCheckStartMonth: moment.utc().add(1, 'days').format('MM'),
        liveCheckStartYear: moment.utc().add(1, 'days').format('YYYY')
      }
      newCheckWindowLiveCheckStartDateValidator.validate(validationError, liveCheckStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckStartDay', checkWindowErrorMessages.liveCheckStartDayWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckStartDay', checkWindowErrorMessages.liveCheckStartDayInvalidChars)
    })
    it('calls addError with liveCheckStartMonthRequired, message if the live check start month is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const liveCheckStartDateData = {
        liveCheckStartDay: moment.utc().add(1, 'days').format('DD'),
        liveCheckStartMonth: '',
        liveCheckStartYear: moment.utc().add(1, 'days').format('YYYY')
      }
      newCheckWindowLiveCheckStartDateValidator.validate(validationError, liveCheckStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckStartMonth', checkWindowErrorMessages.liveCheckStartMonthRequired)
    })
    it('calls addError with liveCheckStartMonthWrongDay and liveCheckStartMonthInvalidChars messages if the live check start month is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const liveCheckStartDateData = {
        liveCheckStartDay: moment.utc().add(1, 'days').format('DD'),
        liveCheckStartMonth: 'tw',
        liveCheckStartYear: moment.utc().add(1, 'days').format('YYYY')
      }
      newCheckWindowLiveCheckStartDateValidator.validate(validationError, liveCheckStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckStartMonth', checkWindowErrorMessages.liveCheckStartMonthWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckStartMonth', checkWindowErrorMessages.liveCheckStartMonthInvalidChars)
    })
    it('calls addError with liveCheckStartYearRequired, message if the live check start year is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const liveCheckStartDateData = {
        liveCheckStartDay: moment.utc().add(1, 'days').format('DD'),
        liveCheckStartMonth: moment.utc().add(1, 'days').format('MM'),
        liveCheckStartYear: ''
      }
      newCheckWindowLiveCheckStartDateValidator.validate(validationError, liveCheckStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckStartYear', checkWindowErrorMessages.liveCheckStartYearRequired)
    })
    it('calls addError with liveCheckStartYearWrongDay and liveCheckStartYearInvalidChars messages if the live check start year is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const liveCheckStartDateData = {
        liveCheckStartDay: moment.utc().add(1, 'days').format('DD'),
        liveCheckStartMonth: moment.utc().add(1, 'days').format('MM'),
        liveCheckStartYear: 'th'
      }
      newCheckWindowLiveCheckStartDateValidator.validate(validationError, liveCheckStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckStartYear', checkWindowErrorMessages.liveCheckStartYearWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckStartYear', checkWindowErrorMessages.liveCheckStartYearInvalidChars)
    })
    it('calls addError with liveCheckStartYearWrongDay and liveCheckStartYearInvalidChars messages if the live check start year is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const liveCheckStartDateData = {
        liveCheckStartDay: moment.utc().add(1, 'days').format('DD'),
        liveCheckStartMonth: moment.utc().add(1, 'days').format('MM'),
        liveCheckStartYear: moment.utc().add(1, 'days').format('YY')
      }
      newCheckWindowLiveCheckStartDateValidator.validate(validationError, liveCheckStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckStartYear', checkWindowErrorMessages.liveCheckStartYearWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckStartYear', checkWindowErrorMessages.liveCheckStartYearInvalidChars)
    })
    it('calls addError with liveCheckStartYearWrongDay message if the live check start year is in the past', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const liveCheckStartDateData = {
        liveCheckStartDay: moment.utc().add(1, 'days').format('DD'),
        liveCheckStartMonth: moment.utc().add(1, 'days').format('MM'),
        liveCheckStartYear: moment.utc().subtract(1, 'year').format('YYYY')
      }
      newCheckWindowLiveCheckStartDateValidator.validate(validationError, liveCheckStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('liveCheckStartYear', checkWindowErrorMessages.liveCheckStartYearWrongDay)
    })
    it('calls addError with liveCheckStartDateInThePast message if the live check start date is in the past', () => {
      const validationError = new ValidationError()
      const addErrorSpy = spyOn(validationError, 'addError')
      const liveCheckStartDateData = {
        liveCheckStartDay: moment.utc().add(1, 'days').format('DD'),
        liveCheckStartMonth: moment.utc().add(1, 'days').format('MM'),
        liveCheckStartYear: moment.utc().subtract(1, 'year').format('YYYY')
      }
      newCheckWindowLiveCheckStartDateValidator.validate(validationError, liveCheckStartDateData)
      expect(addErrorSpy.calls.argsFor(1)).toEqual([ 'liveCheckStartDateInThePast', true ])
    })
  })
})
