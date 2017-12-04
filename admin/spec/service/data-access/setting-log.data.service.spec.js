'use strict'

/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')

const SettingLog = require('../../../models/setting-log')

describe('setting-log.data.service', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#create', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(SettingLog.prototype).expects('save').resolves({test: true})
      service = proxyquire('../../../services/data-access/setting-log.data.service', {
        '../../models/setting-log': SettingLog
      })
    })

    it('calls the model', () => {
      service.create({ prop: 'some-prop' })
      expect(mock.verify()).toBe(true)
    })
  })
})
