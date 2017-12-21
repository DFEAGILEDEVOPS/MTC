'use strict'
/* global beforeEach, afterEach, describe, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const settingDataService = require('../../services/data-access/setting.data.service')
const settingLogDataService = require('../../services/data-access/setting-log.data.service')

describe('setting.service', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('get', () => {
    console.log('sandbox:', sandbox)
    let mock

    beforeEach(() => {
      const databaseRecord = { questionTimeLimit: 1, loadingTimeLimit: 2 }
      mock = sandbox.mock(settingDataService).expects('sqlFindOne').resolves(databaseRecord)
      service = proxyquire('../../services/setting.service', {
        '../../services/data-access/setting.data.service': settingDataService
      })
    })

    it('calls the setting data service', () => {
      service.get()
      expect(mock.verify()).toBe(true)
    })
  })

  describe('update', () => {
    let settingMock
    let settingLogMock

    beforeEach(() => {
      const updateResult = { rowsAffected: 1 }
      settingMock = sandbox.mock(settingDataService).expects('sqlUpdate').resolves(updateResult)
      settingLogMock = sandbox.mock(settingLogDataService).expects('sqlCreate').resolves(updateResult)
      service = proxyquire('../../services/setting.service', {
        '../../services/data-access/setting.data.service': settingDataService,
        '../../services/data-access/setting-log.data.service': settingLogDataService
      })
    })

    it('records the setting change in the settingsLog table', () => {
      service.update(1, 2, 3)
      expect(settingMock.verify()).toBe(true)
      expect(settingLogMock.verify()).toBe(true)
    })
  })
})
