'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')

const Check = require('../../../models/check')
const checkMock = require('../../mocks/check')
const sqlService = require('../../../services/data-access/sql.service')

describe('check.data.service', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#sqlFindOneByCheckCode', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(sqlService).expects('query').resolves(checkMock)
      service = proxyquire('../../../services/data-access/check.data.service', {
        '../../../services/data-access/sql.service': sqlService
      })
    })

    it('makes the expected calls', () => {
      service.sqlFindOneByCheckCode('mock-check-code')
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#find', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(Check).expects('find').chain('lean').chain('exec').resolves(checkMock)
      service = proxyquire('../../../services/data-access/check.data.service', {
        '../../models/check': Check
      })
    })

    it('makes the expected calls', () => {
      service.find({'testCriteria': 'someValue'})
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#findLatestCheck', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(Check).expects('findOne').chain('sort').chain('lean').chain('exec').resolves(checkMock)
      service = proxyquire('../../../services/data-access/check.data.service', {
        '../../models/check': Check
      })
    })

    it('should makes the expecte call', () => {
      service.findLatestCheck({'_id': '01234'})
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#findFullyPopulated', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(Check).expects('find').chain('populate').chain('lean').chain('exec').resolves(checkMock)
      service = proxyquire('../../../services/data-access/check.data.service', {
        '../../models/check': Check
      })
    })

    it('makes the expected calls', () => {
      service.findFullyPopulated({'testCriteria': 'someValue'})
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#count', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(Check).expects('count').chain('exec').resolves(checkMock)
      service = proxyquire('../../../services/data-access/check.data.service', {
        '../../models/check': Check
      })
    })

    it('makes the expected calls', () => {
      service.count({'testCriteria': 'someValue'})
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#update', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(Check).expects('updateOne')
      service = proxyquire('../../../services/data-access/check.data.service', {
        '../../models/check': Check
      })
    })

    it('makes the expected calls', () => {
      service.update({'testCriteria': 'someValue'}, {'$set': {'someKey': 'someValue'}})
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#create', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(Check.prototype).expects('save')
      service = proxyquire('../../../services/data-access/check.data.service', {
        '../../models/check': Check
      })
    })

    it('makes the expected calls', () => {
      service.create({test: 'property'})
      expect(mock.verify()).toBe(true)
    })
  })
})
