'use strict'

/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const sqlService = require('../../../services/data-access/sql.service')

describe('setting-log.data.service', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#sqlCreate', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(sqlService).expects('modify').resolves({rowsAffected: 1})
      service = proxyquire('../../../services/data-access/setting-log.data.service', {
        '../../../services/data-access/sql.service': sqlService
      })
    })

    it('calls the model', () => {
      service.sqlCreate(10, 5, 999)
      expect(mock.verify()).toBe(true)
    })
  })
})
