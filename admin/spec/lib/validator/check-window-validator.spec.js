'use strict'
const moment = require('moment')

/* global beforeEach, describe, it, expect */

const checkWindowValidator = require('../../../lib/validator/check-window-validator')
const expressValidator = require('express-validator')()

describe('Check window validator', function () {
  let req = null

  function getBody (
    checkWindowName,
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

    req.body = getBody(
      checkWindowName,
      adminStartDate,
      checkStartDate,
      checkEndDate,
      checkWindowId
    )

    return expressValidator(req, {}, function () {
      done()
    })
  })

  it('should allow a valid request', async function (done) {
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(false)
    done()
  })

  it('should require a check window name', async function (done) {
    req.body.checkWindowName = ''
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    done()
  })

  it('should require a check window name with at least two characters', async function (done) {
    req.body.checkWindowName = 'x'
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    done()
  })

  it('should require an admin day', async function (done) {

    req.body.adminStartDay = ''
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    done()
  })

  it('should require an admin month', async function (done) {
    req.body.adminStartMonth = ''
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    done()
  })

  it('should require an admin year', async function (done) {
    req.body.adminStartYear = ''
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    done()
  })

  it('should require a check start day', async function (done) {
    req.body.checkStartDay = ''
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    done()
  })

  it('should require a check start month', async function (done) {
    req.body.checkStartMonth = ''
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    done()
  })

  it('should require a check start year', async function (done) {
    req.body.checkStartYear = ''
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    done()
  })

  it('should require a check end day', async function (done) {
    req.body.checkEndDay = ''
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    done()
  })

  it('should require a check end month', async function (done) {
    req.body.checkEndMonth = ''
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    done()
  })

  it('should require a check end year', async function (done) {
    req.body.checkEndYear = ''
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    done()
  })

  describe('Custom validation', function () {
    it('should returns false when details are correct', async function (done) {
      const validationError = await checkWindowValidator.validate(req)
      expect(validationError.hasError()).toBe(false)
      done()
    })

    it('should return true when admin start is earlier than now', async function (done) {
      const checkStartDate = moment.utc().subtract(2, 'days').subtract(1, 'years')
      req.body.checkStartDay = checkStartDate.format('D')
      req.body.checkStartMonth = checkStartDate.format('MM')
      req.body.checkStartYear = checkStartDate.format('YYYY')
      let validationError = await checkWindowValidator.validate(req)
      expect(validationError.hasError()).toBe(true)
      done()
    })

    it('should return true when check start is before than admin start', async function (done) {
      const checkWindowName = 'Windows test 1'
      const adminStartDate = moment.utc().add(3, 'days').add(1, 'years')
      const checkStartDate = moment.utc().add(2, 'days').add(1, 'years')
      const checkEndDate = moment.utc().add(10, 'days').add(1, 'years')
      const checkWindowId = ''
      req.body = getBody(
        checkWindowName,
        adminStartDate,
        checkStartDate,
        checkEndDate,
        checkWindowId
      )
      const validationError = await checkWindowValidator.validate(req)
      expect(validationError.hasError()).toBe(true)
      done()
    })

    it('should return true when check start is after than admin start', async function (done) {
      const checkWindowName = 'Windows test 1'
      const adminStartDate = moment.utc().add(6, 'days').add(1, 'years')
      const checkStartDate = moment.utc().add(5, 'days').add(1, 'years')
      const checkEndDate = moment.utc().add(10, 'days').add(1, 'years')
      const checkWindowId = ''
      req.body = getBody(
        checkWindowName,
        adminStartDate,
        checkStartDate,
        checkEndDate,
        checkWindowId
      )
      const validationError = await checkWindowValidator.validate(req)
      expect(validationError.hasError()).toBe(true)
      done()
    })

    it('should return true when check end is before than check start', async function (done) {
      const checkWindowName = 'Windows test 1'
      const adminStartDate = moment.utc().add(3, 'days').add(1, 'years')
      const checkStartDate = moment.utc().add(11, 'days').add(1, 'years')
      const checkEndDate = moment.utc().add(10, 'days').add(1, 'years')
      const checkWindowId = ''
      req.body = getBody(
        checkWindowName,
        adminStartDate,
        checkStartDate,
        checkEndDate,
        checkWindowId)
      const validationError = await checkWindowValidator.validate(req)
      expect(validationError.hasError()).toBe(true)
      done()
    })

    it('should return true when check end is before than check start', async function (done) {
      const checkWindowName = 'Windows test 1'
      const adminStartDate = moment.utc().add(3, 'days').add(1, 'years')
      const checkStartDate = moment.utc().add(11, 'days').add(1, 'years')
      const checkEndDate = moment.utc().add(10, 'days').add(1, 'years')
      const checkWindowId = ''
      req.body = getBody(
        checkWindowName,
        adminStartDate,
        checkStartDate,
        checkEndDate,
        checkWindowId
        )
      const validationError = await checkWindowValidator.validate(req)
      expect(validationError.hasError()).toBe(true)
      done()
    })
  })
})
