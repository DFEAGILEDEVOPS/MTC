'use strict'

/* global describe, it, spyOn expect */

const moment = require('moment')
const checkWindowErrorMessages = require('../../../../../lib/errors/new-check-window')
const ValidationError = require('../../../../../lib/validation-error')
const newCheckWindowAdminEndDateValidator = require('../../../../../lib/validator/new-check-window/new-check-window-admin-end-date-validator')

describe('New check window admin end date validator', function () {
  describe('validate', function () {
    it('should not call addError method if the validation is successful', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const adminEndDateData = {
        adminEndDay: moment.utc().add(1, 'days').format('DD'),
        adminEndMonth: moment.utc().add(1, 'days').format('MM'),
        adminEndYear: moment.utc().add(1, 'days').format('YYYY')
      }
      newCheckWindowAdminEndDateValidator.validate(validationError, adminEndDateData)
      expect(validationError.addError).not.toHaveBeenCalled()
    })
    it('calls addError with adminEndDayRequired message if the admin end day is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const adminEndDateData = {
        adminEndDay: '',
        adminEndMonth: moment.utc().add(1, 'days').format('MM'),
        adminEndYear: moment.utc().add(1, 'days').format('YYYY')
      }
      newCheckWindowAdminEndDateValidator.validate(validationError, adminEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndDay', checkWindowErrorMessages.adminEndDayRequired)
    })
    it('calls addError with adminEndDayWrongDay and adminEndDayInvalidChars messages if the admin end day is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const adminEndDateData = {
        adminEndDay: 'on',
        adminEndMonth: moment.utc().add(1, 'days').format('MM'),
        adminEndYear: moment.utc().add(1, 'days').format('YYYY')
      }
      newCheckWindowAdminEndDateValidator.validate(validationError, adminEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndDay', checkWindowErrorMessages.adminEndDayWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndDay', checkWindowErrorMessages.adminEndDayInvalidChars)
    })
    it('calls addError with adminEndMonthRequired, message if the admin end month is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const adminEndDateData = {
        adminEndDay: moment.utc().add(1, 'days').format('DD'),
        adminEndMonth: '',
        adminEndYear: moment.utc().add(1, 'days').format('YYYY')
      }
      newCheckWindowAdminEndDateValidator.validate(validationError, adminEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndMonth', checkWindowErrorMessages.adminEndMonthRequired)
    })
    it('calls addError with adminEndMonthWrongDay and adminEndMonthInvalidChars messages if the admin end month is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const adminEndDateData = {
        adminEndDay: moment.utc().add(1, 'days').format('DD'),
        adminEndMonth: 'tw',
        adminEndYear: moment.utc().add(1, 'days').format('YYYY')
      }
      newCheckWindowAdminEndDateValidator.validate(validationError, adminEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndMonth', checkWindowErrorMessages.adminEndMonthWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndMonth', checkWindowErrorMessages.adminEndMonthInvalidChars)
    })
    it('calls addError with adminEndYearRequired, message if the admin end year is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const adminEndDateData = {
        adminEndDay: moment.utc().add(1, 'days').format('DD'),
        adminEndMonth: moment.utc().add(1, 'days').format('MM'),
        adminEndYear: ''
      }
      newCheckWindowAdminEndDateValidator.validate(validationError, adminEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndYear', checkWindowErrorMessages.adminEndYearRequired)
    })
    it('calls addError with adminEndYearWrongDay and adminEndYearInvalidChars messages if the admin end year is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const adminEndDateData = {
        adminEndDay: moment.utc().add(1, 'days').format('DD'),
        adminEndMonth: moment.utc().add(1, 'days').format('MM'),
        adminEndYear: 'th'
      }
      newCheckWindowAdminEndDateValidator.validate(validationError, adminEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndYear', checkWindowErrorMessages.adminEndYearWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndYear', checkWindowErrorMessages.adminEndYearInvalidChars)
    })
    it('calls addError with adminEndYearWrongDay and adminEndYearInvalidChars messages if the admin end year is invalid', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const adminEndDateData = {
        adminEndDay: moment.utc().add(1, 'days').format('DD'),
        adminEndMonth: moment.utc().add(1, 'days').format('MM'),
        adminEndYear: moment.utc().add(1, 'days').format('YY')
      }
      newCheckWindowAdminEndDateValidator.validate(validationError, adminEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndYear', checkWindowErrorMessages.adminEndYearWrongDay)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndYear', checkWindowErrorMessages.adminEndYearInvalidChars)
    })
    it('calls addError with adminEndYearWrongDay message if the admin end year is in the past', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      const adminEndDateData = {
        adminEndDay: moment.utc().add(1, 'days').format('DD'),
        adminEndMonth: moment.utc().add(1, 'days').format('MM'),
        adminEndYear: moment.utc().subtract(1, 'year').format('YYYY')
      }
      newCheckWindowAdminEndDateValidator.validate(validationError, adminEndDateData)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndYear', checkWindowErrorMessages.adminEndYearWrongDay)
    })
    it('calls addError with adminEndDateInThePast message if the admin end date is in the past', () => {
      const validationError = new ValidationError()
      const addErrorSpy = spyOn(validationError, 'addError')
      const adminEndDateData = {
        adminEndDay: moment.utc().add(1, 'days').format('DD'),
        adminEndMonth: moment.utc().add(1, 'days').format('MM'),
        adminEndYear: moment.utc().subtract(1, 'year').format('YYYY')
      }
      newCheckWindowAdminEndDateValidator.validate(validationError, adminEndDateData)
      expect(addErrorSpy.calls.argsFor(1)).toEqual([ 'adminEndDateInThePast', true ])
    })
  })
})
