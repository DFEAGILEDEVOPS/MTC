'use strict'
/* global spyOn, describe, it, expect jest */

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
    it('only caches for 5 minutes', async () => {
      const now = new Date()
      spyOn(settingDataService, 'sqlFindOne').and.returnValue(databaseRecord)
      await settingService.get(true) // 1st call

      const nowPlusFiveMinutes = new Date(now.getTime() + 5 * 60.010 * 1000)
      Date.now = jest.fn().mockReturnValue(nowPlusFiveMinutes)
      await settingService.get() // 2nd call

      const nowPlusSixMinutes = new Date(nowPlusFiveMinutes + 59.998 * 1000)
      Date.now = jest.fn().mockReturnValue(nowPlusSixMinutes)
      await settingService.get() // cached response

      expect(settingDataService.sqlFindOne).toHaveBeenCalledTimes(2)
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
