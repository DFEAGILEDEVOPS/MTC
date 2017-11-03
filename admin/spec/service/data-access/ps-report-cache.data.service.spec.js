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

  describe('#save', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(PsReportCache).expects('update').chain('exec').resolves({})
      service = proxyquire('../../../services/data-access/ps-report-cache.data.service', {
        '../../models/ps-report-cache': PsReportCache
      })
    })

    it('validates the mock', async (done) => {
      await service.save({ mock: 'object' })
      expect(mock.verify()).toBe(true)
      done()
    })
  })

  describe('#find', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(PsReportCache).expects('find').chain('lean').chain('exec').resolves({})
      service = proxyquire('../../../services/data-access/ps-report-cache.data.service', {
        '../../models/ps-report-cache': PsReportCache
      })
    })

    it('validates the mock', async (done) => {
      await service.find({ mock: 'object' })
      expect(mock.verify()).toBe(true)
      done()
    })
  })
})
