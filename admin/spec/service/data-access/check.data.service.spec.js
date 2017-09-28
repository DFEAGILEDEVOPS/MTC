'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')

const Check = require('../../../models/check')
const checkMock = require('../../mocks/check')

describe('check.data.service', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#findOneByCheckCode', () => {
    let mock

    beforeEach(() => {
      mock = sinon.mock(Check).expects('findOne').chain('lean').chain('exec').resolves(checkMock)
      service = proxyquire('../../../services/data-access/check.data.service', {
        '../../models/check': Check
      })
    })

    it('calls the model', () => {
      service.findOneByCheckCode('mock-check-code')
      expect(mock.verify()).toBe(true)
    })
  })
})
