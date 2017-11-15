'use strict'

/* global beforeEach, describe, it, expect */

const mongoose = require('mongoose')
mongoose.Promomise = global.Promise

const moment = require('moment')
const sinon = require('sinon')
require('sinon-mongoose')

const CheckWindow = require('../../models/check-window')
const CheckWindowMock = require('../mocks/check-window')
const CheckWindowMocks = require('../mocks/check-windows')

describe('check-window schema', function () {
  let sandbox
  let checkWindow

  beforeEach(function () {
    checkWindow = new CheckWindow({
      checkWindowName: 'Test check window',
      adminStartDate: moment().toDate(),
      checkStartDate: moment().add('2', 'days').toDate(),
      checkEndDate: moment().add('6', 'weeks').toDate(),
      registrationStartDate: moment().toDate(),
      forms: []
    })

    sandbox = sinon.sandbox.create()
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should allow a valid object', function (done) {
    checkWindow.validate(function (error) {
      expect(error).toBe(null)
      done()
    })
  })

  it('should require a checkWindowName property', function (done) {
    checkWindow.checkWindowName = undefined
    checkWindow.validate(error => {
      expect(error).toBeDefined()
      expect(error.errors.checkWindowName).toBeDefined()
      expect(error.errors.checkWindowName.message).toBe('Path `checkWindowName` is required.')
      done()
    })
  })

  it('should require an adminStartDate property', function (done) {
    checkWindow.adminStartDate = undefined
    checkWindow.validate(error => {
      expect(error).toBeDefined()
      expect(error.errors.adminStartDate).toBeDefined()
      expect(error.errors.adminStartDate.message).toBe('Path `adminStartDate` is required.')
      done()
    })
  })

  it('should require an checkStartDate property', function (done) {
    checkWindow.checkStartDate = undefined
    checkWindow.validate(error => {
      expect(error).toBeDefined()
      expect(error.errors.checkStartDate).toBeDefined()
      expect(error.errors.checkStartDate.message).toBe('Path `checkStartDate` is required.')
      done()
    })
  })

  it('should require a checkEndDate property', function (done) {
    checkWindow.checkEndDate = undefined
    checkWindow.validate(error => {
      expect(error).toBeDefined()
      expect(error.errors.checkEndDate).toBeDefined()
      expect(error.errors.checkEndDate.message).toBe('Path `checkEndDate` is required.')
      done()
    })
  })
})
