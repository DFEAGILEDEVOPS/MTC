'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')

const CompletedChecks = require('../../../models/completed-checks')
const completedChecksMock = require('../../mocks/completed-checks')

describe('completed-checks.data.service', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#create', () => {
    let mock

    beforeEach(() => {
      mock = sinon.mock(CompletedChecks.prototype).expects('save').resolves(completedChecksMock)
      service = proxyquire('../../../services/data-access/completed-check.data.service', {
        '../../models/completed-checks': CompletedChecks
      })
    })

    it('calls the model', () => {
      service.create({ mock: 'object' })
      expect(mock.verify()).toBe(true)
    })
  })
})
