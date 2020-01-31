'use strict'
/* global spyOn, describe, it, expect */

const settingDataService = require('../../../services/data-access/setting.data.service')
const settingLogDataService = require('../../../services/data-access/setting-log.data.service')
const redisCacheService = require('../../../services/data-access/redis-cache.service')
const settingService = require('../../../services/setting.service')

const settingsRedisKey = 'settings'

describe('setting.service', () => {
  const databaseRecord = { questionTimeLimit: 1, loadingTimeLimit: 2, checkTimeLimit: 30 }
  describe('get', () => {
    it('should call redis cache service to fetch the settings', async () => {
      spyOn(redisCacheService, 'get')
      spyOn(settingDataService, 'sqlFindOne')
      await settingService.get()
      expect(redisCacheService.get).toHaveBeenCalled()
    })
    it('should not call settingDataService.sqlFindOne if settings are fetched from redis', async () => {
      spyOn(redisCacheService, 'get').and.returnValue(databaseRecord)
      spyOn(settingDataService, 'sqlFindOne')
      await settingService.get()
      expect(redisCacheService.get).toHaveBeenCalled()
      expect(settingDataService.sqlFindOne).not.toHaveBeenCalled()
    })
    it('should call settingDataService.sqlFindOne if redis service returns false while attempting to fetch the settings', async () => {
      spyOn(redisCacheService, 'get').and.returnValue(false)
      spyOn(settingDataService, 'sqlFindOne')
      spyOn(redisCacheService, 'set')
      await settingService.get()
      expect(redisCacheService.get).toHaveBeenCalled()
      expect(settingDataService.sqlFindOne).toHaveBeenCalled()
    })
    it('should call redisCacheService.set if redis service returns false while attempting to fetch the settings', async () => {
      spyOn(redisCacheService, 'get').and.returnValue(false)
      spyOn(settingDataService, 'sqlFindOne')
      spyOn(redisCacheService, 'set')
      await settingService.get()
      expect(redisCacheService.set).toHaveBeenCalled()
    })
    it('should call settingDataService.sqlFindOne if undefined is returned from redis service', async () => {
      spyOn(redisCacheService, 'get')
      spyOn(settingDataService, 'sqlFindOne')
      spyOn(redisCacheService, 'set')
      await settingService.get()
      expect(redisCacheService.get).toHaveBeenCalled()
      expect(settingDataService.sqlFindOne).toHaveBeenCalled()
    })
    it('should call redisCacheService.set if undefined is returned from redis service', async () => {
      spyOn(redisCacheService, 'get')
      spyOn(settingDataService, 'sqlFindOne')
      spyOn(redisCacheService, 'set')
      await settingService.get()
      expect(redisCacheService.set).toHaveBeenCalled()
    })
    it('returns settings from settings data service', async () => {
      spyOn(redisCacheService, 'get')
      spyOn(settingDataService, 'sqlFindOne').and.returnValue(databaseRecord)
      const result = await settingService.get()
      expect(result).toBe(databaseRecord)
    })
    it('returns config data (if present) if data service does not have any data', async () => {
      spyOn(redisCacheService, 'get')
      spyOn(settingDataService, 'sqlFindOne')
      const result = await settingService.get()
      expect(result).toStrictEqual({ questionTimeLimit: undefined, loadingTimeLimit: undefined, checkTimeLimit: undefined })
    })
  })

  describe('update', () => {
    it('records the setting change in the settingsLog table', async () => {
      const updateResult = { rowsAffected: 1 }
      spyOn(settingDataService, 'sqlUpdate').and.returnValue(updateResult)
      spyOn(settingLogDataService, 'sqlCreate').and.returnValue(updateResult)
      spyOn(redisCacheService, 'set')
      await settingService.update(1, 2, 3, 4)
      expect(settingDataService.sqlUpdate).toHaveBeenCalled()
      expect(settingLogDataService.sqlCreate).toHaveBeenCalled()
    })
    it('should call redisCacheService.set after a successful database transmission', async () => {
      const updateResult = { rowsAffected: 1 }
      spyOn(settingDataService, 'sqlUpdate').and.returnValue(updateResult)
      spyOn(settingLogDataService, 'sqlCreate').and.returnValue(updateResult)
      spyOn(redisCacheService, 'set')
      await settingService.update(1, 2, 3, 4)
      expect(redisCacheService.set).toHaveBeenCalledWith(settingsRedisKey, { questionTimeLimit: 2, loadingTimeLimit: 1, checkTimeLimit: 3 })
    })
  })
})
