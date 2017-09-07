'use strict'

/* global beforeEach, describe, it, expect */

const Setting = require('../../models/setting')

describe('Setting schema', function () {
  let setting

  beforeEach(function () {
    setting = new Setting({
      questionTimeLimit: 5,
      loadingTimeLimit: 3
    })
  })

  it('validates a correct setting entry', function (done) {
    setting.validate(error => {
      expect(error).toBe(null)
      done()
    })
  })

  it('requires a questionTimeLimit', function (done) {
    setting.questionTimeLimit = undefined
    setting.validate(error => {
      expect(error.errors.questionTimeLimit).toBeDefined()
      done()
    })
  })

  it('requires a loadingTimeLimit', function (done) {
    setting.loadingTimeLimit = undefined
    setting.validate(error => {
      expect(error.errors.loadingTimeLimit).toBeDefined()
      done()
    })
  })
})
