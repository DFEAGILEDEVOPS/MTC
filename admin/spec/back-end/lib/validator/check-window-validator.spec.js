'use strict'

/* global beforeEach, describe, it, expect */
const moment = require('moment')
const checkWindowValidator = require('../../../../lib/validator/check-window-validator')
const checkWindowValidatorMsgs = require('../../../../lib/errors/check-window')
const expressValidator = require('express-validator')()

describe('Test window validator', function () {
  let req = null

  function getBody (checkWindowName,
    adminStartDate,
    checkStartDate,
    checkEndDate,
    checkWindowId) {
    return {
      checkWindowName: checkWindowName,
      adminStartDay: adminStartDate.format('D'),
      adminStartMonth: adminStartDate.format('MM'),
      adminStartYear: adminStartDate.format('YYYY'),
      checkStartDay: checkStartDate.format('D'),
      checkStartMonth: checkStartDate.format('MM'),
      checkStartYear: checkStartDate.format('YYYY'),
      checkEndDay: checkEndDate.format('D'),
      checkEndMonth: checkEndDate.format('MM'),
      checkEndYear: checkEndDate.format('YYYY'),
      checkWindowId: checkWindowId
    }
  }

  beforeEach(function (done) {
    req = {
      query: {},
      body: {},
      params: {},
      param: (name) => {
        this.params[name] = name
      }
    }

    const checkWindowName = 'Test Check Window 1'
    const adminStartDate = moment.utc().add(2, 'days').add(1, 'years')
    const checkStartDate = moment.utc().add(5, 'days').add(1, 'years')
    const checkEndDate = moment.utc().add(10, 'days').add(1, 'years')
    const checkWindowId = ''
    const existingAdminStartDate = ''
    const adminIsDisabled = ''

    req.body = getBody(
      checkWindowName,
      adminStartDate,
      checkStartDate,
      checkEndDate,
      checkWindowId,
      existingAdminStartDate,
      adminIsDisabled
    )

    return expressValidator(req, {}, function () {
      done()
    })
  })

  describe('When creating a new check window', function () {
    it('should allow a valid request', async function (done) {
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(false)
      done()
    })

    it('should require a check window name', async function (done) {
      req.body.checkWindowName = ''
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('checkWindowName')).toBe(true)
      expect(validationError.errors.checkWindowName).toBe(checkWindowValidatorMsgs.checkWindowNameLength)
      done()
    })

    it('should require a check window name with at least two characters', async function (done) {
      req.body.checkWindowName = 'x'
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('checkWindowName')).toBe(true)
      expect(validationError.errors.checkWindowName).toBe(checkWindowValidatorMsgs.checkWindowNameLength)
      done()
    })

    it('should require an admin day', async function (done) {
      req.body.adminStartDay = ''
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('adminStartDay')).toBe(true)
      expect(validationError.errors.adminStartDay).toBe(checkWindowValidatorMsgs.adminStartDayRequired)
      done()
    })

    it('should require an admin month', async function (done) {
      req.body.adminStartMonth = ''
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('adminStartMonth')).toBe(true)
      expect(validationError.errors.adminStartMonth).toBe(checkWindowValidatorMsgs.adminStartMonthRequired)
      done()
    })

    it('should require an admin year', async function (done) {
      req.body.adminStartYear = ''
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('adminStartYear')).toBe(true)
      expect(validationError.errors.adminStartYear).toBe(checkWindowValidatorMsgs.adminStartYearRequired)
      done()
    })

    it('should require a check start day', async function (done) {
      req.body.checkStartDay = ''
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('checkStartDay')).toBe(true)
      expect(validationError.errors.checkStartDay).toBe(checkWindowValidatorMsgs.checkStartDayRequired)
      done()
    })

    it('should require a check start month', async function (done) {
      req.body.checkStartMonth = ''
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('checkStartMonth')).toBe(true)
      expect(validationError.errors.checkStartMonth).toBe(checkWindowValidatorMsgs.checkStartMonthRequired)
      done()
    })

    it('should require a check start year', async function (done) {
      req.body.checkStartYear = ''
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('checkStartYear')).toBe(true)
      expect(validationError.errors.checkStartYear).toBe(checkWindowValidatorMsgs.checkStartYearRequired)
      done()
    })

    it('should require a check end day', async function (done) {
      req.body.checkEndDay = ''
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('checkEndDay')).toBe(true)
      expect(validationError.errors.checkEndDay).toBe(checkWindowValidatorMsgs.checkEndDayRequired)
      done()
    })

    it('should require a check end month', async function (done) {
      req.body.checkEndMonth = ''
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('checkEndMonth')).toBe(true)
      expect(validationError.errors.checkEndMonth).toBe(checkWindowValidatorMsgs.checkEndMonthRequired)
      done()
    })

    it('should require a check end year', async function (done) {
      req.body.checkEndYear = ''
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('checkEndYear')).toBe(true)
      expect(validationError.errors.checkEndYear).toBe(checkWindowValidatorMsgs.checkEndYearRequired)
      done()
    })
  })

  describe('When editing a check window', function () {
    it('should require a check window name when editing', async function (done) {
      req.body.checkWindowName = ''
      req.body.checkWindowId = 'abc123'
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('checkWindowName')).toBe(true)
      expect(validationError.errors.checkWindowName).toBe(checkWindowValidatorMsgs.checkWindowNameLength)
      done()
    })

    it('should require an admin day when editing', async function (done) {
      req.body.adminStartDay = ''
      req.body.checkWindowId = 'abc123'
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('adminStartDay')).toBe(true)
      expect(validationError.errors.adminStartDay).toBe(checkWindowValidatorMsgs.adminStartDayRequired)
      done()
    })

    it('should require an admin month when editing', async function (done) {
      req.body.adminStartMonth = ''
      req.body.checkWindowId = 'abc123'
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('adminStartMonth')).toBe(true)
      expect(validationError.errors.adminStartMonth).toBe(checkWindowValidatorMsgs.adminStartMonthRequired)
      done()
    })

    it('should require an admin year when editing', async function (done) {
      req.body.adminStartYear = ''
      req.body.checkWindowId = 'abc123'
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('adminStartYear')).toBe(true)
      expect(validationError.errors.adminStartYear).toBe(checkWindowValidatorMsgs.adminStartYearRequired)
      done()
    })

    it('should require an check start day when editing', async function (done) {
      req.body.checkStartDay = ''
      req.body.checkWindowId = 'abc123'
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('checkStartDay')).toBe(true)
      expect(validationError.errors.checkStartDay).toBe(checkWindowValidatorMsgs.checkStartDayRequired)
      done()
    })

    it('should require an check start month when editing', async function (done) {
      req.body.checkStartMonth = ''
      req.body.checkWindowId = 'abc123'
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('checkStartMonth')).toBe(true)
      expect(validationError.errors.checkStartMonth).toBe(checkWindowValidatorMsgs.checkStartMonthRequired)
      done()
    })

    it('should require an check start year when editing', async function (done) {
      req.body.checkStartYear = ''
      req.body.checkWindowId = 'abc123'
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('checkStartYear')).toBe(true)
      expect(validationError.errors.checkStartYear).toBe(checkWindowValidatorMsgs.checkStartYearRequired)
      done()
    })

    it('should require an check end day when editing', async function (done) {
      req.body.checkEndDay = ''
      req.body.checkWindowId = 'abc123'
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('checkEndDay')).toBe(true)
      expect(validationError.errors.checkEndDay).toBe(checkWindowValidatorMsgs.checkEndDayRequired)
      done()
    })

    it('should require an check end month when editing', async function (done) {
      req.body.checkEndMonth = ''
      req.body.checkWindowId = 'abc123'
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('checkEndMonth')).toBe(true)
      expect(validationError.errors.checkEndMonth).toBe(checkWindowValidatorMsgs.checkEndMonthRequired)
      done()
    })

    it('should require an check end year when editing', async function (done) {
      req.body.checkEndYear = ''
      req.body.checkWindowId = 'abc123'
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('checkEndYear')).toBe(true)
      expect(validationError.errors.checkEndYear).toBe(checkWindowValidatorMsgs.checkEndYearRequired)
      done()
    })
  })

  describe('When custom validation is applied', function () {
    it('should returns false (no errors) when details are correct', async function (done) {
      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(false)
      done()
    })

    it('should return a custom error when admin start date is invalid', async function (done) {
      const adminStartDate = moment.utc().add(1, 'years')
      req.body.adminStartDay = '31'
      req.body.adminStartMonth = '11'
      req.body.adminStartYear = adminStartDate.format('YYYY')

      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.errors.adminDateInvalid).toBe(true)
      done()
    })

    it('should return a custom error when admin start date is earlier than now', async function (done) {
      const adminStartDate = moment.utc().subtract(2, 'days').subtract(1, 'years')
      req.body.adminStartDay = adminStartDate.format('D')
      req.body.adminStartMonth = adminStartDate.format('MM')
      req.body.adminStartYear = adminStartDate.format('YYYY')

      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.errors.adminDateInThePast).toBe(true)
      done()
    })

    it('should return a custom error when check start date is before admin start date', async function (done) {
      const checkStartDate = moment.utc().add(1, 'days').add(1, 'years')
      req.body.checkStartDay = checkStartDate.format('D')
      req.body.checkStartMonth = checkStartDate.format('MM')
      req.body.checkStartYear = checkStartDate.format('YYYY')

      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.errors.checkDateBeforeAdminDate).toBe(true)
      done()
    })

    it('should return a custom error when check start date is invalid', async function (done) {
      const checkStartDate = moment.utc().add(1, 'years')
      req.body.checkStartDay = '31'
      req.body.checkStartMonth = '11'
      req.body.checkStartYear = checkStartDate.format('YYYY')

      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.errors.checkStartDateInvalid).toBe(true)
      done()
    })

    it('should return a custom error when check start date is before check end date', async function (done) {
      const checkStartDate = moment.utc().add(11, 'days').add(1, 'years')
      req.body.checkStartDay = checkStartDate.format('D')
      req.body.checkStartMonth = checkStartDate.format('MM')
      req.body.checkStartYear = checkStartDate.format('YYYY')

      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.errors.checkStartDateAfterEndDate).toBe(true)
      done()
    })

    it('should return a custom error when check end date is invalid', async function (done) {
      const checkEndDate = moment.utc().add(1, 'years')
      req.body.checkEndDay = '31'
      req.body.checkEndMonth = '11'
      req.body.checkEndYear = checkEndDate.format('YYYY')

      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.errors.checkEndDateInvalid).toBe(true)
      done()
    })

    it('should return a custom error when check end date is before check start date', async function (done) {
      const checkEndDate = moment.utc().add(4, 'days').add(1, 'years')
      req.body.checkEndDay = checkEndDate.format('D')
      req.body.checkEndMonth = checkEndDate.format('MM')
      req.body.checkEndYear = checkEndDate.format('YYYY')

      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.errors.checkEndDateBeforeStartDate).toBe(true)
      done()
    })

    it('should return a custom error when check start date is before than now', async function (done) {
      const checkStartDate = moment.utc().subtract(1, 'years')
      req.body.checkStartDay = checkStartDate.format('D')
      req.body.checkStartMonth = checkStartDate.format('MM')
      req.body.checkStartYear = checkStartDate.format('YYYY')

      const validationError = await checkWindowValidator.validate(req.body, req.checkBody, req.getValidationResult)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.errors.checkStartDateInThePast).toBe(true)
      done()
    })
  })
})
