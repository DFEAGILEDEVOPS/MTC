'use strict'
/* global spyOn beforeEach, afterEach, describe, it, expect */

const sinon = require('sinon')
const settingDataService = require('../../../services/data-access/setting.data.service')
const settingLogDataService = require('../../../services/data-access/setting-log.data.service')
const settingService = require('../../../services/setting.service')

describe('setting.service', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('get', () => {
    it('calls the setting data service', async () => {
      const databaseRecord = { questionTimeLimit: 1, loadingTimeLimit: 2 }
      spyOn(settingDataService, 'sqlFindOne').and.returnValue(databaseRecord)
      const result = await settingService.get()
      expect(Object.keys(result).length).toBe(2)
    })
  })

  describe('update', () => {
    it('records the setting change in the settingsLog table', async () => {
      const updateResult = { rowsAffected: 1 }
      spyOn(settingDataService, 'sqlUpdate').and.returnValue(updateResult)
      spyOn(settingLogDataService, 'sqlCreate').and.returnValue(updateResult)
      await settingService.update(1, 2, 3)
      expect(settingDataService.sqlUpdate).toHaveBeenCalled()
      expect(settingLogDataService.sqlCreate).toHaveBeenCalled()
    })
  })
})
