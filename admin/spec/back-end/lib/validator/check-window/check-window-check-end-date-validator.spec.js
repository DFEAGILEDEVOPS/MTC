'use strict'

/* global describe, it, spyOn expect */

const moment = require('moment')
const checkWindowErrorMessages = require('../../../../../lib/errors/check-window')
const ValidationError = require('../../../../../lib/validation-error')
const checkWindowCheckEndDateValidator = require('../../../../../lib/validator/check-window/check-window-check-end-date-validator')

describe('Check window check end date validator', function () {
  describe('validate', function () {
    it('should not call addError method if the validation is successful', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const checkEndDateData = {
        checkEndDay: moment.utc().add(1, 'days').format('DD'),
        checkEndMonth: moment.utc().add(1, 'days').format('MM'),
        checkEndYear: moment.utc().add(1, 'days').format('YYYY')
      }
      checkWindowCheckEndDateValidator.validate(validationError, checkEndDateData)
      expect(validationError.addError).not.toHaveBeenCalled()
    })
    it('calls addError with checkEndDayRequired messages if the check end day is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const checkEndDateData = {
        checkEndDay: '',
        checkEndMonth: moment.utc().add(1, 'days').format('MM'),
        checkEndYear: moment.utc().add(1, 'days').format('YYYY')
      }
      checkWindowCheckEndDateValidator.validate(validationError, checkEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('checkEndDay', checkWindowErrorMessages.checkEndDayRequired)
    })
    it('calls addError with checkEndDayWrongDay and checkEndDayInvalidChars messages if the check end day is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const checkEndDateData = {
        checkEndDay: 'on',
        checkEndMonth: moment.utc().add(1, 'days').format('MM'),
        checkEndYear: moment.utc().add(1, 'days').format('YYYY')
      }
      checkWindowCheckEndDateValidator.validate(validationError, checkEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('checkEndDay', checkWindowErrorMessages.checkEndDayWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('checkEndDay', checkWindowErrorMessages.checkEndDayInvalidChars)
    })
    it('calls addError with checkEndMonthRequired message if the check end month is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const checkEndDateData = {
        checkEndDay: moment.utc().add(1, 'days').format('DD'),
        checkEndMonth: '',
        checkEndYear: moment.utc().add(1, 'days').format('YYYY')
      }
      checkWindowCheckEndDateValidator.validate(validationError, checkEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('checkEndMonth', checkWindowErrorMessages.checkEndMonthRequired)
    })
    it('calls addError with checkEndMonthWrongDay and checkEndMonthInvalidChars messages if the check end month is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const checkEndDateData = {
        checkEndDay: moment.utc().add(1, 'days').format('DD'),
        checkEndMonth: 'tw',
        checkEndYear: moment.utc().add(1, 'days').format('YYYY')
      }
      checkWindowCheckEndDateValidator.validate(validationError, checkEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('checkEndMonth', checkWindowErrorMessages.checkEndMonthWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('checkEndMonth', checkWindowErrorMessages.checkEndMonthInvalidChars)
    })
    it('calls addError with checkEndYearRequired message if the check end year is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const checkEndDateData = {
        checkEndDay: moment.utc().add(1, 'days').format('DD'),
        checkEndMonth: moment.utc().add(1, 'days').format('MM'),
        checkEndYear: ''
      }
      checkWindowCheckEndDateValidator.validate(validationError, checkEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('checkEndYear', checkWindowErrorMessages.checkEndYearRequired)
    })
    it('calls addError with checkEndYearWrongDay and checkEndYearInvalidChars messages if the check end year is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const checkEndDateData = {
        checkEndDay: moment.utc().add(1, 'days').format('DD'),
        checkEndMonth: moment.utc().add(1, 'days').format('MM'),
        checkEndYear: 'th'
      }
      checkWindowCheckEndDateValidator.validate(validationError, checkEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('checkEndYear', checkWindowErrorMessages.checkEndYearWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('checkEndYear', checkWindowErrorMessages.checkEndYearInvalidChars)
    })
    it('calls addError with checkEndYearWrongDay and checkEndYearInvalidChars messages if the check end year is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const checkEndDateData = {
        checkEndDay: moment.utc().add(1, 'days').format('DD'),
        checkEndMonth: moment.utc().add(1, 'days').format('MM'),
        checkEndYear: moment.utc().add(1, 'days').format('YY')
      }
      checkWindowCheckEndDateValidator.validate(validationError, checkEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('checkEndYear', checkWindowErrorMessages.checkEndYearWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('checkEndYear', checkWindowErrorMessages.checkEndYearInvalidChars)
    })
    it('calls addError with checkEndYearWrongDay message if the check end year is in the past', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const checkEndDateData = {
        checkEndDay: moment.utc().add(1, 'days').format('DD'),
        checkEndMonth: moment.utc().add(1, 'days').format('MM'),
        checkEndYear: moment.utc().subtract(1, 'year').format('YYYY')
      }
      checkWindowCheckEndDateValidator.validate(validationError, checkEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('checkEndYear', checkWindowErrorMessages.checkEndYearWrongDay)
    })
  })
})
