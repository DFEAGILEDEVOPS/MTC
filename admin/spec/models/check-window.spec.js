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
      done()
    })
  })

  it('should require a adminStartDate property', function (done) {
    checkWindow.adminStartDate = undefined
    checkWindow.validate(error => {
      expect(error).toBeDefined()
      expect(error.errors.adminStartDate).toBeDefined()
      done()
    })
  })

  it('should require an checkStartDate property', function (done) {
    checkWindow.checkStartDate = undefined
    checkWindow.validate(error => {
      expect(error).toBeDefined()
      expect(error.errors.checkStartDate).toBeDefined()
      done()
    })
  })

  it('should require a checkEndDate property', function (done) {
    checkWindow.checkEndDate = undefined
    checkWindow.validate(error => {
      expect(error).toBeDefined()
      expect(error.errors.checkEndDate).toBeDefined()
      done()
    })
  })

  describe('Method getCheckWindow', function () {
    it('should return a check window by id', async function (done) {
      expect(typeof CheckWindow.getCheckWindow).toBe('function')
      sandbox
        .mock(CheckWindow)
        .expects('findOne')
        .chain('exec')
        .resolves(CheckWindowMock)

      try {
        const cw = await CheckWindow.getCheckWindow('5964fb80b42c79b8849b33f0')
        const startDate = moment.utc('2017-08-26 00:00:01').toDate()
        const checkStartDate = moment.utc('2017-09-10 00:00:01').toDate()
        const checkEndDate = moment.utc('2017-09-12 00:00:01').toDate()

        expect(cw.checkWindowName).toBe('Check Window Name')
        expect(cw.startDate.toString()).toBe(startDate.toString())
        expect(cw.checkStartDate.toString()).toBe(checkStartDate.toString())
        expect(cw.checkEndDate.toString()).toBe(checkEndDate.toString())
        expect(cw.isDeleted).toBe(false)
        done()
      } catch (err) {
        console.log('ERROR', err)
      }
      done()
    })

    it('should fails', async function (done) {
      const message = 'Failed to get check windows for form.'
      sandbox
        .mock(CheckWindow)
        .expects('findOne')
        .chain('exec')
        .rejects(new Error(message))

      try {
        await CheckWindow.getCheckWindow('5964fb80b42c79b8849b33f0')
        done(new Error('Failed to catch rejected promise'))
      } catch (err) {
        expect(err.message).toBe(message)
      }
      done()
    })
  })

  describe('Method getCheckWindowsAssignedToForms', function () {
    it('should return the expected results', async function (done) {
      expect(typeof CheckWindow.getCheckWindowsAssignedToForms).toBe('function')
      sandbox
        .mock(CheckWindow)
        .expects('find')
        .chain('exec')
        .resolves(CheckWindowMocks)

      try {
        const cw = await CheckWindow.getCheckWindowsAssignedToForms()
        const form1Id = cw[1][0]
        const form5Id = cw[5][0]
        const form8Id = cw[8][0]

        expect(form1Id._id.toString()).toBe('59e8e10039dbad3cd033719a')
        expect(form5Id._id.toString()).toBe('59e8e10039dbad3cd033719a')
        expect(form8Id._id.toString()).toBe('59e88622d38a9f2d1fcebbb3')
        done()
      } catch (err) {
        console.log('ERROR', err)
      }
      done()
    })

    it('should fail', async function (done) {
      const message = 'Failed to get check windows for chosen form.'
      sandbox
        .mock(CheckWindow)
        .expects('find')
        .chain('exec')
        .rejects(new Error(message))

      try {
        await CheckWindow.getCheckWindowsAssignedToForms()
        done(new Error('Failed to catch rejected promise'))
      } catch (err) {
        expect(err.message).toBe(message)
      }
      done()
    })
  })
})
