'use strict'

/* global describe, it, spyOn expect */

const moment = require('moment')
const checkWindowErrorMessages = require('../../../../../lib/errors/check-window-v2')
const ValidationError = require('../../../../../lib/validation-error')
const checkWindowFamiliarisationCheckStartDateValidator = require('../../../../../lib/validator/check-window-v2/check-window-familiarisation-check-start-date-validator')

describe('New check window familiarisation check start date validator', function () {
  describe('validate', function () {
    it('should not call addError method if the validation is successful', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const familiarisationCheckStartDateData = {
        familiarisationCheckStartDay: moment.utc().add(1, 'days').format('DD'),
        familiarisationCheckStartMonth: moment.utc().add(1, 'days').format('MM'),
        familiarisationCheckStartYear: moment.utc().add(1, 'days').format('YYYY')
      }
      checkWindowFamiliarisationCheckStartDateValidator.validate(validationError, familiarisationCheckStartDateData)
      expect(validationError.addError).not.toHaveBeenCalled()
    })
    it('calls addError with familiarisationCheckStartDayWrongDay message if the familiarisation check start day is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const familiarisationCheckStartDateData = {
        familiarisationCheckStartDay: '',
        familiarisationCheckStartMonth: moment.utc().add(1, 'days').format('MM'),
        familiarisationCheckStartYear: moment.utc().add(1, 'days').format('YYYY')
      }
      checkWindowFamiliarisationCheckStartDateValidator.validate(validationError, familiarisationCheckStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckStartDay', checkWindowErrorMessages.familiarisationCheckStartDayWrongDay)
    })
    it('calls addError with familiarisationCheckStartDayWrongDay and familiarisationCheckStartDayInvalidChars messages if the familiarisation check start day is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const familiarisationCheckStartDateData = {
        familiarisationCheckStartDay: 'on',
        familiarisationCheckStartMonth: moment.utc().add(1, 'days').format('MM'),
        familiarisationCheckStartYear: moment.utc().add(1, 'days').format('YYYY')
      }
      checkWindowFamiliarisationCheckStartDateValidator.validate(validationError, familiarisationCheckStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckStartDay', checkWindowErrorMessages.familiarisationCheckStartDayWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckStartDay', checkWindowErrorMessages.familiarisationCheckStartDayInvalidChars)
    })
    it('calls addError with familiarisationCheckStartMonthWrongDay, message if the familiarisation check start month is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const familiarisationCheckStartDateData = {
        familiarisationCheckStartDay: moment.utc().add(1, 'days').format('DD'),
        familiarisationCheckStartMonth: '',
        familiarisationCheckStartYear: moment.utc().add(1, 'days').format('YYYY')
      }
      checkWindowFamiliarisationCheckStartDateValidator.validate(validationError, familiarisationCheckStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckStartMonth', checkWindowErrorMessages.familiarisationCheckStartMonthWrongDay)
    })
    it('calls addError with familiarisationCheckStartMonthWrongDay and familiarisationCheckStartMonthInvalidChars messages if the familiarisation check start month is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const familiarisationCheckStartDateData = {
        familiarisationCheckStartDay: moment.utc().add(1, 'days').format('DD'),
        familiarisationCheckStartMonth: 'tw',
        familiarisationCheckStartYear: moment.utc().add(1, 'days').format('YYYY')
      }
      checkWindowFamiliarisationCheckStartDateValidator.validate(validationError, familiarisationCheckStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckStartMonth', checkWindowErrorMessages.familiarisationCheckStartMonthWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckStartMonth', checkWindowErrorMessages.familiarisationCheckStartMonthInvalidChars)
    })
    it('calls addError with familiarisationCheckStartYearWrongDay, message if the familiarisation check start year is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const familiarisationCheckStartDateData = {
        familiarisationCheckStartDay: moment.utc().add(1, 'days').format('DD'),
        familiarisationCheckStartMonth: moment.utc().add(1, 'days').format('MM'),
        familiarisationCheckStartYear: ''
      }
      checkWindowFamiliarisationCheckStartDateValidator.validate(validationError, familiarisationCheckStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckStartYear', checkWindowErrorMessages.familiarisationCheckStartYearWrongDay)
    })
    it('calls addError with familiarisationCheckStartYearWrongDay and familiarisationCheckStartYearInvalidChars messages if the familiarisation check start year is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const familiarisationCheckStartDateData = {
        familiarisationCheckStartDay: moment.utc().add(1, 'days').format('DD'),
        familiarisationCheckStartMonth: moment.utc().add(1, 'days').format('MM'),
        familiarisationCheckStartYear: 'th'
      }
      checkWindowFamiliarisationCheckStartDateValidator.validate(validationError, familiarisationCheckStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckStartYear', checkWindowErrorMessages.familiarisationCheckStartYearWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckStartYear', checkWindowErrorMessages.familiarisationCheckStartYearInvalidChars)
    })
    it('calls addError with familiarisationCheckStartYearWrongDay and familiarisationCheckStartYearInvalidChars messages if the familiarisation check start year is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const familiarisationCheckStartDateData = {
        familiarisationCheckStartDay: moment.utc().add(1, 'days').format('DD'),
        familiarisationCheckStartMonth: moment.utc().add(1, 'days').format('MM'),
        familiarisationCheckStartYear: moment.utc().add(1, 'days').format('YY')
      }
      checkWindowFamiliarisationCheckStartDateValidator.validate(validationError, familiarisationCheckStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckStartYear', checkWindowErrorMessages.familiarisationCheckStartYearWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckStartYear', checkWindowErrorMessages.familiarisationCheckStartYearInvalidChars)
    })
    it('calls addError with familiarisationCheckStartYearWrongDay message if the familiarisation check start year is in the past', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const familiarisationCheckStartDateData = {
        familiarisationCheckStartDay: moment.utc().add(1, 'days').format('DD'),
        familiarisationCheckStartMonth: moment.utc().add(1, 'days').format('MM'),
        familiarisationCheckStartYear: moment.utc().subtract(1, 'year').format('YYYY')
      }
      checkWindowFamiliarisationCheckStartDateValidator.validate(validationError, familiarisationCheckStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckStartYear', checkWindowErrorMessages.familiarisationCheckStartYearWrongDay)
    })
    it('calls addError with familiarisationCheckStartDateInThePast message if the familiarisation check start date is in the past', () => {
      const validationError = new ValidationError()
      const addErrorSpy = spyOn(validationError, 'addError')
      const familiarisationCheckStartDateData = {
        familiarisationCheckStartDay: moment.utc().add(1, 'days').format('DD'),
        familiarisationCheckStartMonth: moment.utc().add(1, 'days').format('MM'),
        familiarisationCheckStartYear: moment.utc().subtract(1, 'year').format('YYYY')
      }
      checkWindowFamiliarisationCheckStartDateValidator.validate(validationError, familiarisationCheckStartDateData)
      expect(addErrorSpy.calls.argsFor(1)).toEqual([ 'familiarisationCheckStartDateInThePast', true ])
    })
  })
})
