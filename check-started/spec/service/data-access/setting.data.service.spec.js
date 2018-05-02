'use strict'

/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const sqlService = require('../../../services/data-access/sql.service')

describe('pupil.data.service', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#sqlUpdate', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(sqlService).expects('modify').resolves({ rowsModified: 1 })
      service = proxyquire('../../../services/data-access/setting.data.service', {
        '../data-access/sql.service': sqlService
      })
    })

    it('calls the model', () => {
      const loadingTimeLimit = 10
      const questionTimeLimit = 20
      service.sqlUpdate(loadingTimeLimit, questionTimeLimit)
      expect(mock.verify()).toBe(true)
    })
  })
})
