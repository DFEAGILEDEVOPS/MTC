'use strict'

/* global beforeEach, describe, it, expect */

const checkWindowValidator = require('../../../lib/validator/check-window-validator')
const expressValidator = require('express-validator')()

describe('Check window validator', function () {
  let req = null

  function getBody () {
    return {
      checkWindowName: 'Test Check Window 1',
      adminStartDay: '1',
      adminStartMonth: '11',
      adminStartYear: '2017',
      checkStartDay: '5',
      checkStartMonth: '11',
      checkStartYear: '2017',
      checkEndDay: '10',
      checkEndMonth: '11',
      checkEndYear: '2017',
      checkWindowId: ''
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

    return expressValidator(req, {}, function () {
      done()
    })
  })

  it('should allow a valid request', async function (done) {
    req.body = getBody()
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(false)
    done()
  })

  it('should require a check window name', async function (done) {
    req.body = getBody()
    req.body.adminStartDay = ''
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    done()
  })

  it('should require an admin day', async function (done) {
    req.body = getBody()
    req.body.checkWindowName = ''
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    done()
  })

  it('should require an admin month', async function (done) {
    req.body = getBody()
    req.body.adminStartMonth = ''
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    done()
  })

  it('should require an admin year', async function (done) {
    req.body = getBody()
    req.body.adminStartYear = ''
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    done()
  })

  it('should require a check start day', async function (done) {
    req.body = getBody()
    req.body.checkStartDay = ''
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    done()
  })

  it('should require a check start month', async function (done) {
    req.body = getBody()
    req.body.checkStartMonth = ''
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    done()
  })

  it('should require a check start year', async function (done) {
    req.body = getBody()
    req.body.checkStartYear = ''
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    done()
  })

  it('should require a check end day', async function (done) {
    req.body = getBody()
    req.body.checkEndDay = ''
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    done()
  })

  it('should require a check end month', async function (done) {
    req.body = getBody()
    req.body.checkEndMonth = ''
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    done()
  })

  it('should require a check end year', async function (done) {
    req.body = getBody()
    req.body.checkEndYear = ''
    let validationError = await checkWindowValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    done()
  })
})
