'use strict'

/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')

const Setting = require('../../../models/setting')
const settingMock = require('../../mocks/setting')

describe('pupil.data.service', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#findOne', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(Setting).expects('findOne').chain('lean').chain('exec').resolves(settingMock)
      service = proxyquire('../../../services/data-access/setting.data.service', {
        '../../models/setting': Setting
      })
    })

    it('calls the model', () => {
      service.findOne({ _id: 'some-id' })
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#createOrUpdate', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(Setting).expects('update').chain('exec').resolves({ n: 1, nModified: 1, ok: 1 })
      service = proxyquire('../../../services/data-access/setting.data.service', {
        '../../models/setting': Setting
      })
    })

    it('calls the model', () => {
      service.createOrUpdate({ prop: 'some-prop' })
      expect(mock.verify()).toBe(true)
    })
  })
})
