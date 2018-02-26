'use strict'
/* global describe, beforeEach, afterEach, it, expect, spyOn */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
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

  describe('#sqlFindLatestCheck', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(sqlService).expects('query').resolves(checkMock)
      service = proxyquire('../../../services/data-access/check.data.service', {
        '../../../services/data-access/sql.service': sqlService
      })
    })

    it('should makes the expected call', () => {
      service.sqlFindLatestCheck(1234)
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#sqlFindFullyPopulated', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(sqlService).expects('query').resolves(checkMock)
      service = proxyquire('../../../services/data-access/check.data.service', {
        '../../../services/data-access/sql.service': sqlService
      })
    })

    it('makes the expected calls', () => {
      service.sqlFindFullyPopulated({'testCriteria': 'someValue'})
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#sqlFindNumberOfChecksStartedByPupil', () => {
    beforeEach(() => {
      service = require('../../../services/data-access/check.data.service')
      spyOn(sqlService, 'query').and.returnValue([{
        cnt: 5
      }])
    })

    it('makes the expected calls', () => {
      service.sqlFindNumberOfChecksStartedByPupil(1234)
      expect(sqlService.query).toHaveBeenCalled()
    })
  })
})
