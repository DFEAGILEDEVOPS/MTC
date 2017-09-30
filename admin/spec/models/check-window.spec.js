'use strict'

/* global beforeEach, describe, it, expect */

const moment = require('moment')
const CheckWindow = require('../../models/check-window')

describe('check-window schema', function () {
  let checkWindow

  beforeEach(function () {
    checkWindow = new CheckWindow({
      checkWindowName: 'Test check window',
      adminStartDate: moment().toDate(),
      checkStartDate: moment().toDate(),
      checkEndDate: moment().add('6', 'weeks').toDate(),
      registrationStartDate: moment().toDate(),
      forms: []
    })
  })

  it('should allow a valid object', function (done) {
    checkWindow.validate(function (error) {
      expect(error).toBe(null)
      done()
    })
  })

  it('requires a checkWindowName property', function (done) {
    checkWindow.checkWindowName = undefined
    checkWindow.validate(error => {
      expect(error).toBeDefined()
      expect(error.errors.checkWindowName).toBeDefined()
      done()
    })
  })

  it('requires a adminStartDate property', function (done) {
    checkWindow.adminStartDate = undefined
    checkWindow.validate(error => {
      expect(error).toBeDefined()
      expect(error.errors.adminStartDate).toBeDefined()
      done()
    })
  })

  it('requires an checkStartDate property', function (done) {
    checkWindow.checkStartDate = undefined
    checkWindow.validate(error => {
      expect(error).toBeDefined()
      expect(error.errors.checkStartDate).toBeDefined()
      done()
    })
  })

  it('requires a checkEndDate property', function (done) {
    checkWindow.checkEndDate = undefined
    checkWindow.validate(error => {
      expect(error).toBeDefined()
      expect(error.errors.checkEndDate).toBeDefined()
      done()
    })
  })
})
