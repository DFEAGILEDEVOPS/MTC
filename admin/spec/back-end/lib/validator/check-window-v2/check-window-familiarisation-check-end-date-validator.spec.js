'use strict'

/* global describe, it, spyOn expect */

const moment = require('moment')
const checkWindowErrorMessages = require('../../../../../lib/errors/check-window-v2')
const ValidationError = require('../../../../../lib/validation-error')
const checkWindowFamiliarisationCheckEndDateValidator = require('../../../../../lib/validator/check-window-v2/check-window-familiarisation-check-end-date-validator')

describe('New check window familiarisation check end date validator', function () {
  describe('validate', function () {
    it('should not call addError method if the validation is successful', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const familiarisationCheckEndDateData = {
        familiarisationCheckEndDay: moment.utc().add(1, 'days').format('DD'),
        familiarisationCheckEndMonth: moment.utc().add(1, 'days').format('MM'),
        familiarisationCheckEndYear: moment.utc().add(1, 'days').format('YYYY')
      }
      checkWindowFamiliarisationCheckEndDateValidator.validate(validationError, familiarisationCheckEndDateData)
      expect(validationError.addError).not.toHaveBeenCalled()
    })
    it('calls addError with familiarisationCheckEndDayWrongDay message if the familiarisation check end day is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const familiarisationCheckEndDateData = {
        familiarisationCheckEndDay: '',
        familiarisationCheckEndMonth: moment.utc().add(1, 'days').format('MM'),
        familiarisationCheckEndYear: moment.utc().add(1, 'days').format('YYYY')
      }
      checkWindowFamiliarisationCheckEndDateValidator.validate(validationError, familiarisationCheckEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckEndDay', checkWindowErrorMessages.familiarisationCheckEndDayWrongDay)
    })
    it('calls addError with familiarisationCheckEndDayWrongDay and familiarisationCheckEndDayInvalidChars messages if the familiarisation check end day is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const familiarisationCheckEndDateData = {
        familiarisationCheckEndDay: 'on',
        familiarisationCheckEndMonth: moment.utc().add(1, 'days').format('MM'),
        familiarisationCheckEndYear: moment.utc().add(1, 'days').format('YYYY')
      }
      checkWindowFamiliarisationCheckEndDateValidator.validate(validationError, familiarisationCheckEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckEndDay', checkWindowErrorMessages.familiarisationCheckEndDayWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckEndDay', checkWindowErrorMessages.familiarisationCheckEndDayInvalidChars)
    })
    it('calls addError with familiarisationCheckEndMonthWrongDay, message if the familiarisation check end month is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const familiarisationCheckEndDateData = {
        familiarisationCheckEndDay: moment.utc().add(1, 'days').format('DD'),
        familiarisationCheckEndMonth: '',
        familiarisationCheckEndYear: moment.utc().add(1, 'days').format('YYYY')
      }
      checkWindowFamiliarisationCheckEndDateValidator.validate(validationError, familiarisationCheckEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckEndMonth', checkWindowErrorMessages.familiarisationCheckEndMonthWrongDay)
    })
    it('calls addError with familiarisationCheckEndMonthWrongDay and familiarisationCheckEndMonthInvalidChars messages if the familiarisation check end month is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const familiarisationCheckEndDateData = {
        familiarisationCheckEndDay: moment.utc().add(1, 'days').format('DD'),
        familiarisationCheckEndMonth: 'tw',
        familiarisationCheckEndYear: moment.utc().add(1, 'days').format('YYYY')
      }
      checkWindowFamiliarisationCheckEndDateValidator.validate(validationError, familiarisationCheckEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckEndMonth', checkWindowErrorMessages.familiarisationCheckEndMonthWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckEndMonth', checkWindowErrorMessages.familiarisationCheckEndMonthInvalidChars)
    })
    it('calls addError with familiarisationCheckEndYearWrongDay, message if the familiarisation check end year is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const familiarisationCheckEndDateData = {
        familiarisationCheckEndDay: moment.utc().add(1, 'days').format('DD'),
        familiarisationCheckEndMonth: moment.utc().add(1, 'days').format('MM'),
        familiarisationCheckEndYear: ''
      }
      checkWindowFamiliarisationCheckEndDateValidator.validate(validationError, familiarisationCheckEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckEndYear', checkWindowErrorMessages.familiarisationCheckEndYearWrongDay)
    })
    it('calls addError with familiarisationCheckEndYearWrongDay and familiarisationCheckEndYearInvalidChars messages if the familiarisation check end year is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const familiarisationCheckEndDateData = {
        familiarisationCheckEndDay: moment.utc().add(1, 'days').format('DD'),
        familiarisationCheckEndMonth: moment.utc().add(1, 'days').format('MM'),
        familiarisationCheckEndYear: 'th'
      }
      checkWindowFamiliarisationCheckEndDateValidator.validate(validationError, familiarisationCheckEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckEndYear', checkWindowErrorMessages.familiarisationCheckEndYearWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckEndYear', checkWindowErrorMessages.familiarisationCheckEndYearInvalidChars)
    })
    it('calls addError with familiarisationCheckEndYearWrongDay and familiarisationCheckEndYearInvalidChars messages if the familiarisation check end year is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const familiarisationCheckEndDateData = {
        familiarisationCheckEndDay: moment.utc().add(1, 'days').format('DD'),
        familiarisationCheckEndMonth: moment.utc().add(1, 'days').format('MM'),
        familiarisationCheckEndYear: moment.utc().add(1, 'days').format('YY')
      }
      checkWindowFamiliarisationCheckEndDateValidator.validate(validationError, familiarisationCheckEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckEndYear', checkWindowErrorMessages.familiarisationCheckEndYearWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckEndYear', checkWindowErrorMessages.familiarisationCheckEndYearInvalidChars)
    })
    it('calls addError with familiarisationCheckEndYearWrongDay message if the familiarisation check end year is in the past', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const familiarisationCheckEndDateData = {
        familiarisationCheckEndDay: moment.utc().add(1, 'days').format('DD'),
        familiarisationCheckEndMonth: moment.utc().add(1, 'days').format('MM'),
        familiarisationCheckEndYear: moment.utc().subtract(1, 'year').format('YYYY')
      }
      checkWindowFamiliarisationCheckEndDateValidator.validate(validationError, familiarisationCheckEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('familiarisationCheckEndYear', checkWindowErrorMessages.familiarisationCheckEndYearWrongDay)
    })
    it('calls addError with familiarisationCheckEndDateInThePast message if the familiarisation check end date is in the past', () => {
      const validationError = new ValidationError()
      const addErrorSpy = spyOn(validationError, 'addError')
      const familiarisationCheckEndDateData = {
        familiarisationCheckEndDay: moment.utc().add(1, 'days').format('DD'),
        familiarisationCheckEndMonth: moment.utc().add(1, 'days').format('MM'),
        familiarisationCheckEndYear: moment.utc().subtract(1, 'year').format('YYYY')
      }
      checkWindowFamiliarisationCheckEndDateValidator.validate(validationError, familiarisationCheckEndDateData)
      expect(addErrorSpy.calls.argsFor(1)).toEqual([ 'familiarisationCheckEndDateInThePast', true ])
    })
  })
})
