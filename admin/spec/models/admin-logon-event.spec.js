'use strict'
/* global beforeEach, describe, it, expect */

const AdminLogonEvent = require('../../models/admin-logon-event')

describe('admin-logon-event model', function (done) {
  let logonEvent

  beforeEach(function () {
    logonEvent = new AdminLogonEvent({
      sessionId: 'abcd-1234',
      isAuthenticated: true,
      errorMsg: null,
      body: 'a string',
      remoteIp: '127.0.0.1',
      userAgent: 'test suite',
      loginMethod: 'ncaTools',
      ncaEmailAddress: 'test@example.com',
      ncaUserType: 'School nom',
      ncaUserName: 'The Teacher',
      ncaSessionToken: 'abcd-defg-1234',
      school: 12345678,
      role: 'TEACHER'
    })
  })

  it('validates a valid model', function (done) {
    logonEvent.validate(function (err) {
      expect(err).toBeNull()
      done()
    })
  })

  it('requires an isAuthenticated property', function (done) {
    logonEvent.isAuthenticated = undefined
    logonEvent.validate(function (err) {
      expect(err.errors.isAuthenticated).toBeDefined()
      done()
    })
  })

  it('requires a loginMethod property', function (done) {
    logonEvent.loginMethod = undefined
    logonEvent.validate(function (err) {
      expect(err.errors.loginMethod).toBeDefined()
      done()
    })
  })
})
