'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')

const CheckWindow = require('../../../models/check-window')
const checkWindowMock = require('../../mocks/check-window')
const checkWindowDeletedMock = require('../../mocks/check-window-isDeleted')
const checkWindowsMock = require('../../mocks/check-windows')

describe('check.data.service', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#fetchCheckWindow', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(CheckWindow).expects('findOne').chain('exec').resolves(checkWindowMock)
      service = proxyquire('../../../services/data-access/check-window.data.service', {
        '../../models/check': CheckWindow
      })
    })

    it('should make the expected calls', async () => {
      await service.fetchCheckWindow('5964fb80b42c79b8849b33f0')
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#fetchCheckWindows', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(CheckWindow).expects('find').chain('sort').chain('exec').resolves(checkWindowsMock)
      service = proxyquire('../../../services/data-access/check-window.data.service', {
        '../../models/check': CheckWindow
      })
    })

    it('should make the expected calls', async () => {
      await service.fetchCheckWindows('name', 'asc', false)
      expect(mock.verify()).toBe(true)
    })
  })
})
