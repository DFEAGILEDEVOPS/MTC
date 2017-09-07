'use strict'
/* global describe it expect */

const LogonEvent = require('../../models/logon-event')

describe('logon event schema', function () {
  it('requires a sessionId', function (done) {
    let e = new LogonEvent()
    e.validate(function (err) {
      expect(err).toBeDefined()
      expect(err.errors).toBeDefined()
      expect(err.errors.sessionId).toBeDefined()
      done()
    })
  })

  it('requires an isAuthenticated field', function (done) {
    let e = new LogonEvent({sessionId: 's'})
    e.validate(function (err) {
      expect(err).toBeDefined()
      expect(err.errors.isAuthenticated).toBeDefined()
      done()
    })
  })

  it('trims the value of 4-digit pins', function () {
    let s = ' input '
    let e = new LogonEvent({pin4Digit: s})
    expect(e.pin4Digit).toBe('input')
  })

  it('detects low invalid dobDay', function (done) {
    let e = new LogonEvent({sessionId: 's', isAuthenticated: true, dobDay: 0})
    e.validate(function (err) {
      expect(err).toBeDefined()
      expect(err.errors.dobDay).toBeDefined()
      done()
    })
  })

  it('detects high invalid dobDay', function (done) {
    let e = new LogonEvent({sessionId: 's', isAuthenticated: true, dobDay: 32})
    e.validate(function (err) {
      expect(err).toBeDefined()
      expect(err.errors.dobDay).toBeDefined()
      done()
    })
  })

  it('detects low invalid dobMonth', function (done) {
    let e = new LogonEvent({sessionId: 's', isAuthenticated: true, dobMonth: 0})
    e.validate(function (err) {
      expect(err).toBeDefined()
      expect(err.errors.dobMonth).toBeDefined()
      done()
    })
  })

  it('detects high invalid dobMonth', function (done) {
    let e = new LogonEvent({sessionId: 's', isAuthenticated: true, dobMonth: 13})
    e.validate(function (err) {
      expect(err).toBeDefined()
      expect(err.errors.dobMonth).toBeDefined()
      done()
    })
  })
})
