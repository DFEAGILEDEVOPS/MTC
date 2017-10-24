'use strict'

/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')
const PsReportCache = require('../../../models/ps-report-cache')

describe('PsReportCacheDataService', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#create', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(PsReportCache.prototype).expects('save').resolves({})
      service = proxyquire('../../../services/data-access/ps-report-cache.data.service', {
        '../../models/ps-report-cache': PsReportCache
      })
    })

    it('validates the mock', async (done) => {
      await service.create({ mock: 'object' })
      expect(mock.verify()).toBe(true)
      done()
    })
  })
})
