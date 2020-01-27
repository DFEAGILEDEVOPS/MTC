'use strict'
/* global spyOn, describe, it, expect */

const settingDataService = require('../../../services/data-access/setting.data.service')
const settingLogDataService = require('../../../services/data-access/setting-log.data.service')
const settingService = require('../../../services/setting.service')

describe('setting.service', () => {
  const databaseRecord = { questionTimeLimit: 1, loadingTimeLimit: 2, checkTimeLimit: 30 }

  describe('get', () => {
    it('should cache successive calls', async () => {
      spyOn(settingDataService, 'sqlFindOne').and.returnValue(databaseRecord)
      await settingService.get(true)
      await settingService.get()
      await settingService.get()
      expect(settingDataService.sqlFindOne).toHaveBeenCalledTimes(1)
    })
    it('calls the setting data service', async () => {
      const databaseRecord = { questionTimeLimit: 1, loadingTimeLimit: 2, checkTimeLimit: 30 }
      spyOn(settingDataService, 'sqlFindOne').and.returnValue(databaseRecord)
      const result = await settingService.get()
      expect(Object.keys(result).length).toBe(3)
    })
  })

  describe('update', () => {
    it('records the setting change in the settingsLog table', async () => {
      const updateResult = { rowsAffected: 1 }
      spyOn(settingDataService, 'sqlUpdate').and.returnValue(updateResult)
      spyOn(settingLogDataService, 'sqlCreate').and.returnValue(updateResult)
      await settingService.update(1, 2, 3, 4)
      expect(settingDataService.sqlUpdate).toHaveBeenCalled()
      expect(settingLogDataService.sqlCreate).toHaveBeenCalled()
    })
  })
})
