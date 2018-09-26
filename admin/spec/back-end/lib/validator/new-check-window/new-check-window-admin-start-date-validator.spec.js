'use strict'

/* global describe, it, spyOn expect */

const moment = require('moment')
const checkWindowErrorMessages = require('../../../../../lib/errors/new-check-window')
const ValidationError = require('../../../../../lib/validation-error')
const newCheckWindowAdminStartDateValidator = require('../../../../../lib/validator/new-check-window/new-check-window-admin-start-date-validator')

describe('New check window admin start date validator', function () {
  describe('validate', function () {
    it('should not call addError method if the validation is successful', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const adminStartDateData = {
        adminStartDay: moment.utc().add(1, 'days').format('DD'),
        adminStartMonth: moment.utc().add(1, 'days').format('MM'),
        adminStartYear: moment.utc().add(1, 'days').format('YYYY')
      }
      newCheckWindowAdminStartDateValidator.validate(validationError, adminStartDateData)
      expect(validationError.addError).not.toHaveBeenCalled()
    })
    it('calls addError with adminStartDayRequired message if the admin start day is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const adminStartDateData = {
        adminStartDay: '',
        adminStartMonth: moment.utc().add(1, 'days').format('MM'),
        adminStartYear: moment.utc().add(1, 'days').format('YYYY')
      }
      newCheckWindowAdminStartDateValidator.validate(validationError, adminStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('adminStartDay', checkWindowErrorMessages.adminStartDayRequired)
    })
    it('calls addError with adminStartDayWrongDay and adminStartDayInvalidChars messages if the admin start day is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const adminStartDateData = {
        adminStartDay: 'on',
        adminStartMonth: moment.utc().add(1, 'days').format('MM'),
        adminStartYear: moment.utc().add(1, 'days').format('YYYY')
      }
      newCheckWindowAdminStartDateValidator.validate(validationError, adminStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('adminStartDay', checkWindowErrorMessages.adminStartDayWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('adminStartDay', checkWindowErrorMessages.adminStartDayInvalidChars)
    })
    it('calls addError with adminStartMonthRequired, message if the admin start month is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const adminStartDateData = {
        adminStartDay: moment.utc().add(1, 'days').format('DD'),
        adminStartMonth: '',
        adminStartYear: moment.utc().add(1, 'days').format('YYYY')
      }
      newCheckWindowAdminStartDateValidator.validate(validationError, adminStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('adminStartMonth', checkWindowErrorMessages.adminStartMonthRequired)
    })
    it('calls addError with adminStartMonthWrongDay and adminStartMonthInvalidChars messages if the admin start month is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const adminStartDateData = {
        adminStartDay: moment.utc().add(1, 'days').format('DD'),
        adminStartMonth: 'tw',
        adminStartYear: moment.utc().add(1, 'days').format('YYYY')
      }
      newCheckWindowAdminStartDateValidator.validate(validationError, adminStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('adminStartMonth', checkWindowErrorMessages.adminStartMonthWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('adminStartMonth', checkWindowErrorMessages.adminStartMonthInvalidChars)
    })
    it('calls addError with adminStartYearRequired, message if the admin start year is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const adminStartDateData = {
        adminStartDay: moment.utc().add(1, 'days').format('DD'),
        adminStartMonth: moment.utc().add(1, 'days').format('MM'),
        adminStartYear: ''
      }
      newCheckWindowAdminStartDateValidator.validate(validationError, adminStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('adminStartYear', checkWindowErrorMessages.adminStartYearRequired)
    })
    it('calls addError with adminStartYearWrongDay and adminStartYearInvalidChars messages if the admin start year is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const adminStartDateData = {
        adminStartDay: moment.utc().add(1, 'days').format('DD'),
        adminStartMonth: moment.utc().add(1, 'days').format('MM'),
        adminStartYear: 'th'
      }
      newCheckWindowAdminStartDateValidator.validate(validationError, adminStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('adminStartYear', checkWindowErrorMessages.adminStartYearWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('adminStartYear', checkWindowErrorMessages.adminStartYearInvalidChars)
    })
    it('calls addError with adminStartYearWrongDay and adminStartYearInvalidChars messages if the admin start year is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const adminStartDateData = {
        adminStartDay: moment.utc().add(1, 'days').format('DD'),
        adminStartMonth: moment.utc().add(1, 'days').format('MM'),
        adminStartYear: moment.utc().add(1, 'days').format('YY')
      }
      newCheckWindowAdminStartDateValidator.validate(validationError, adminStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('adminStartYear', checkWindowErrorMessages.adminStartYearWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('adminStartYear', checkWindowErrorMessages.adminStartYearInvalidChars)
    })
    it('calls addError with adminStartYearWrongDay message if the admin start year is in the past', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const adminStartDateData = {
        adminStartDay: moment.utc().add(1, 'days').format('DD'),
        adminStartMonth: moment.utc().add(1, 'days').format('MM'),
        adminStartYear: moment.utc().subtract(1, 'year').format('YYYY')
      }
      newCheckWindowAdminStartDateValidator.validate(validationError, adminStartDateData)
      expect(validationError.addError).toHaveBeenCalledWith('adminStartYear', checkWindowErrorMessages.adminStartYearWrongDay)
    })
    it('calls addError with adminStartDateInThePast message if the admin start date is in the past', () => {
      const validationError = new ValidationError()
      const addErrorSpy = spyOn(validationError, 'addError')
      const adminStartDateData = {
        adminStartDay: moment.utc().add(1, 'days').format('DD'),
        adminStartMonth: moment.utc().add(1, 'days').format('MM'),
        adminStartYear: moment.utc().subtract(1, 'year').format('YYYY')
      }
      newCheckWindowAdminStartDateValidator.validate(validationError, adminStartDateData)
      expect(addErrorSpy.calls.argsFor(1)).toEqual([ 'adminStartDateInThePast', true ])
    })
  })
})
