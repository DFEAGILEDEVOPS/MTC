'use strict'
/* global describe expect it beforeEach */

const User = require('../../models/user')

describe('User model', function () {
  let user

  beforeEach(function () {
    user = new User({
      email: 'test@example.com',
      passwordHash: 'hash',
      school: 123435678,
      role: 'TEACHER'
    })
  })

  it('validates a valid model', function (done) {
    user.validate(function (err) {
      expect(err).toBeNull()
      done()
    })
  })

  it('requires an email', function (done) {
    user.email = undefined
    user.validate(function (err) {
      expect(err.errors.email).toBeDefined()
      done()
    })
  })

  it('requires an passwordHash', function (done) {
    user.passwordHash = undefined
    user.validate(function (err) {
      expect(err.errors.passwordHash).toBeDefined()
      done()
    })
  })

  it('requires a role', function (done) {
    user.role = undefined
    user.validate(function (err) {
      expect(err.errors.role).toBeDefined()
      done()
    })
  })

  it('requires a valid role', function (done) {
    user.role = 'NOT A REAL ROLE'
    user.validate(function (err) {
      expect(err.errors.role).toBeDefined()
      done()
    })
  })
})
