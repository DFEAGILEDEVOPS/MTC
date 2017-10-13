'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')

const School = require('../../../models/school')
const schoolMock = require('../../mocks/school')

describe('school.data.service', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#findOne', () => {
    let mock

    beforeEach(() => {
      mock = sinon.mock(School).expects('findOne').chain('lean').chain('exec').resolves(schoolMock)
      service = proxyquire('../../../services/data-access/school.data.service', {
        '../../models/school': School
      })
    })

    it('calls the model', () => {
      service.findOne({_id: 'some-id'})
      expect(mock.verify()).toBe(true)
    })
  })
})
