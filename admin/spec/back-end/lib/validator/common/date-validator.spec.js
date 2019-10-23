'use strict'

/* global describe, it, spyOn expect beforeEach afterEach */

const moment = require('moment')
const checkWindowErrorMessages = require('../../../../../lib/errors/check-window-v2')
const ValidationError = require('../../../../../lib/validation-error')
const dateValidator = require('../../../../../lib/validator/common/date-validator')

describe('New check window date validator', function () {
  describe('validate', function () {
    let validationData
    let addErrorSpy
    const validationError = new ValidationError()
    beforeEach(() => {
      validationData = {
        day: moment.utc().add(1, 'days').format('DD'),
        month: moment.utc().add(1, 'days').format('MM'),
        year: moment.utc().add(1, 'days').format('YYYY'),
        dayHTMLAttributeId: 'adminEndDay',
        monthHTMLAttributeId: 'adminEndMonth',
        yearHTMLAttributeId: 'adminEndYear',
        wrongDayMessage: checkWindowErrorMessages.adminEndDayWrong,
        wrongMonthMessage: checkWindowErrorMessages.adminEndMonthWrong,
        wrongYearMessage: checkWindowErrorMessages.adminEndYearWrong,
        dayInvalidChars: checkWindowErrorMessages.adminEndDayInvalidChars,
        monthInvalidChars: checkWindowErrorMessages.adminEndMonthInvalidChars,
        yearInvalidChars: checkWindowErrorMessages.adminEndYearInvalidChars,
        dateInThePast: 'adminEndDateInThePast'
      }
      addErrorSpy = spyOn(validationError, 'addError').and.callThrough()
    })
    afterEach(() => {
      validationError.errors = {}
    })
    it('should not call addError method if the validation is successful', () => {
      dateValidator.validate(validationError, validationData)
      expect(validationError.addError).not.toHaveBeenCalled()
    })
    it('calls addError with adminEndDayWrong message if the admin end day is missing', () => {
      validationData.day = ''
      dateValidator.validate(validationError, validationData)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndDay', checkWindowErrorMessages.adminEndDayWrong)
    })
    it('calls addError with adminEndDayWrong and adminEndDayInvalidChars messages if the admin end day is invalid', () => {
      validationData.day = 'on'
      dateValidator.validate(validationError, validationData)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndDay', checkWindowErrorMessages.adminEndDayWrong)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndDay', checkWindowErrorMessages.adminEndDayInvalidChars)
    })
    it('calls addError with adminEndMonthWrong, message if the admin end month is missing', () => {
      validationData.month = ''
      dateValidator.validate(validationError, validationData)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndMonth', checkWindowErrorMessages.adminEndMonthWrong)
    })
    it('calls addError with adminEndMonthWrong and adminEndMonthInvalidChars messages if the admin end month is invalid', () => {
      validationData.month = 'tw'
      dateValidator.validate(validationError, validationData)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndMonth', checkWindowErrorMessages.adminEndMonthWrong)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndMonth', checkWindowErrorMessages.adminEndMonthInvalidChars)
    })
    it('calls addError with adminEndYearWrong, message if the admin end year is missing', () => {
      validationData.year = ''
      dateValidator.validate(validationError, validationData)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndYear', checkWindowErrorMessages.adminEndYearWrong)
    })
    it('calls addError with adminEndYearWrong and adminEndYearInvalidChars messages if the admin end year is invalid', () => {
      validationData.year = 'th'
      dateValidator.validate(validationError, validationData)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndYear', checkWindowErrorMessages.adminEndYearWrong)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndYear', checkWindowErrorMessages.adminEndYearInvalidChars)
    })
    it('calls addError with adminEndYearWrong and adminEndYearInvalidChars messages if the admin end year is invalid', () => {
      validationData.year = moment.utc().add(1, 'days').format('YY')
      dateValidator.validate(validationError, validationData)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndYear', checkWindowErrorMessages.adminEndYearWrong)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndYear', checkWindowErrorMessages.adminEndYearInvalidChars)
    })
    it('calls addError with adminEndYearWrong and adminEndDateInThePast messages if the admin end year is in the past', () => {
      validationData.year = moment.utc().subtract(1, 'year').format('YYYY')
      dateValidator.validate(validationError, validationData)
      expect(validationError.addError).toHaveBeenCalledWith('adminEndYear', checkWindowErrorMessages.adminEndYearWrong)
      expect(addErrorSpy.calls.argsFor(1)).toEqual(['adminEndDateInThePast', true])
    })
    it('does not call addError with adminEndYearWrong and adminEndDateInThePast messages if the admin end year is today', () => {
      validationData.year = moment.utc().format('YYYY')
      dateValidator.validate(validationError, validationData)
      expect(validationError.addError).not.toHaveBeenCalled()
    })
    it('calls addError with adminEndDay message if the admin end day exceeds the maximum for the specific month', () => {
      validationData.day = '30'
      validationData.month = '02'
      validationData.year = moment.utc().add(1, 'days').format('YYYY')
      dateValidator.validate(validationError, validationData)
      expect(validationError.errors.adminEndDay).toBeTruthy()
      expect(Object.keys(validationError.errors).length).toBe(1)
    })
  })
})
