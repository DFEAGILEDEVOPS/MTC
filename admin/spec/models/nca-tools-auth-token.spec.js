'use strict'
/* global describe it expect beforeEach */

const NcaToolsAuthToken = require('../../models/nca-tools-auth-token')

describe('nca tools auth token model', function () {
  let ncaToolsAuthToken

  beforeEach(function () {
    ncaToolsAuthToken = new NcaToolsAuthToken({
      _id: 'abcd-1234',
      logonDate: new Date(),
      ncaUserType: 'TEACHER',
      ncaUserName: 'a person',
      ncaEmailAddress: 'test@example.com',
      school: '12345678'
    })
  })

  it('validates a valid model', function (done) {
    ncaToolsAuthToken.validate(function (err) {
      expect(err).toBeNull()
      done()
    })
  })

  it('requires an logonDate', function (done) {
    ncaToolsAuthToken.logonDate = undefined
    ncaToolsAuthToken.validate(function (err) {
      expect(err.errors.logonDate).toBeDefined()
      done()
    })
  })

  it('requires an ncaUserType', function (done) {
    ncaToolsAuthToken.ncaUserType = undefined
    ncaToolsAuthToken.validate(function (err) {
      expect(err.errors.ncaUserType).toBeDefined()
      done()
    })
  })

  it('requires an ncaUserName', function (done) {
    ncaToolsAuthToken.ncaUserName = undefined
    ncaToolsAuthToken.validate(function (err) {
      expect(err.errors.ncaUserName).toBeDefined()
      done()
    })
  })

  it('requires an ncaEmailAddress', function (done) {
    ncaToolsAuthToken.ncaEmailAddress = undefined
    ncaToolsAuthToken.validate(function (err) {
      expect(err.errors.ncaEmailAddress).toBeDefined()
      done()
    })
  })

  it('requires a school', function (done) {
    ncaToolsAuthToken.school = undefined
    ncaToolsAuthToken.validate(function (err) {
      expect(err.errors.school).toBeDefined()
      done()
    })
  })
})
