'use strict'

/* global beforeEach, describe, it, expect */

const SettingLog = require('../../models/setting-log')

describe('SettingLog schema', function () {
  let settingLog

  beforeEach(function () {
    settingLog = new SettingLog({
      adminSession: 'bF3nGcJ-C8QHxvC6LMNF2TiRK0_0OAHT',
      emailAddress: 'test@mail.com',
      userName: 'teacher1',
      questionTimeLimit: 5,
      loadingTimeLimit: 3
    })
  })

  it('validates a correct setting entry', function (done) {
    settingLog.validate(error => {
      expect(error).toBe(null)
      done()
    })
  })

  it('requires a adminSession', function (done) {
    settingLog.adminSession = undefined
    settingLog.validate(error => {
      expect(error.errors.adminSession).toBeDefined()
      done()
    })
  })

  it('requires a emailAddress', function (done) {
    settingLog.emailAddress = undefined
    settingLog.validate(error => {
      expect(error.errors.emailAddress).toBeDefined()
      done()
    })
  })

  it('requires a userName', function (done) {
    settingLog.userName = undefined
    settingLog.validate(error => {
      expect(error.errors.userName).toBeDefined()
      done()
    })
  })

  it('requires a questionTimeLimit', function (done) {
    settingLog.questionTimeLimit = undefined
    settingLog.validate(error => {
      expect(error.errors.questionTimeLimit).toBeDefined()
      done()
    })
  })

  it('requires a loadingTimeLimit', function (done) {
    settingLog.loadingTimeLimit = undefined
    settingLog.validate(error => {
      expect(error.errors.loadingTimeLimit).toBeDefined()
      done()
    })
  })
})
