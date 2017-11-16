'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const moment = require('moment')
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

    it('should fetch a check window document', async () => {
      await service.fetchCheckWindow()
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#setDeletedCheckWindow', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(CheckWindow).expects('updateOne').chain('exec').resolves(checkWindowDeletedMock)
      service = proxyquire('../../../services/data-access/check-window.data.service', {
        '../../models/check': CheckWindow
      })
    })

    it('should update a check window with specific id to be deleted', async () => {
      await service.setDeletedCheckWindow()
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

    it('should fetch check windows documents', async () => {
      await service.fetchCheckWindows('name', 'asc', false)
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#fetchCurrentCheckWindow', () => {
    let mock

    beforeEach(() => {
      const currentCheckWindowsMock = checkWindowsMock[0]
      const now = moment.utc(moment.now())
      currentCheckWindowsMock.checkStartDate = moment.utc(now).toDate()
      currentCheckWindowsMock.checkEndDate = moment.utc(now).toDate()
      mock = sandbox.mock(CheckWindow).expects('findOne').chain('exec').resolves(currentCheckWindowsMock)
      service = proxyquire('../../../services/data-access/check-window.data.service', {
        '../../models/check': CheckWindow
      })
    })

    it('should fetch one check window document that is current', async () => {
      service.fetchCurrentCheckWindow()
      expect(mock.verify()).toBe(true)
    })
  })
})
