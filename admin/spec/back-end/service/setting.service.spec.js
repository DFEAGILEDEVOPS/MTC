'use strict'

const settingDataService = require('../../../services/data-access/setting.data.service')
const settingLogDataService = require('../../../services/data-access/setting-log.data.service')
const redisCacheService = require('../../../services/data-access/redis-cache.service')
const settingService = require('../../../services/setting.service')

const settingsRedisKey = 'settings'

describe('setting.service', () => {
  const databaseRecord = { questionTimeLimit: 1, loadingTimeLimit: 2, checkTimeLimit: 30, isPostisPostAdminEndDateUnavailable: false }

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('get', () => {
    test('should call redis cache service to fetch the settings', async () => {
      jest.spyOn(redisCacheService, 'get').mockImplementation()
      jest.spyOn(settingDataService, 'sqlFindOne').mockImplementation()
      jest.spyOn(redisCacheService, 'set').mockImplementation()
      await settingService.get()
      expect(redisCacheService.get).toHaveBeenCalled()
    })

    test('should not call settingDataService.sqlFindOne if settings are fetched from redis', async () => {
      jest.spyOn(redisCacheService, 'get').mockResolvedValue(databaseRecord)
      jest.spyOn(settingDataService, 'sqlFindOne').mockImplementation()
      jest.spyOn(redisCacheService, 'set').mockImplementation()
      await settingService.get()
      expect(redisCacheService.get).toHaveBeenCalled()
      expect(settingDataService.sqlFindOne).not.toHaveBeenCalled()
    })

    test('should call settingDataService.sqlFindOne if redis service returns false while attempting to fetch the settings', async () => {
      jest.spyOn(redisCacheService, 'get').mockResolvedValue(false)
      jest.spyOn(settingDataService, 'sqlFindOne').mockImplementation()
      jest.spyOn(redisCacheService, 'set').mockImplementation()
      await settingService.get()
      expect(redisCacheService.get).toHaveBeenCalled()
      expect(settingDataService.sqlFindOne).toHaveBeenCalled()
    })

    test('should call redisCacheService.set if redis service returns false while attempting to fetch the settings', async () => {
      jest.spyOn(redisCacheService, 'get').mockResolvedValue(false)
      jest.spyOn(settingDataService, 'sqlFindOne').mockImplementation()
      jest.spyOn(redisCacheService, 'set').mockImplementation()
      await settingService.get()
      expect(redisCacheService.set).toHaveBeenCalled()
    })

    test('should call settingDataService.sqlFindOne if undefined is returned from redis service', async () => {
      jest.spyOn(redisCacheService, 'get').mockImplementation()
      jest.spyOn(settingDataService, 'sqlFindOne').mockImplementation()
      jest.spyOn(redisCacheService, 'set').mockImplementation()
      await settingService.get()
      expect(redisCacheService.get).toHaveBeenCalled()
      expect(settingDataService.sqlFindOne).toHaveBeenCalled()
    })

    test('should call redisCacheService.set if undefined is returned from redis service', async () => {
      jest.spyOn(redisCacheService, 'get').mockImplementation()
      jest.spyOn(settingDataService, 'sqlFindOne').mockImplementation()
      jest.spyOn(redisCacheService, 'set').mockImplementation()
      await settingService.get()
      expect(redisCacheService.set).toHaveBeenCalled()
    })

    test('returns settings from settings data service', async () => {
      jest.spyOn(redisCacheService, 'get').mockImplementation()
      jest.spyOn(settingDataService, 'sqlFindOne').mockResolvedValue(databaseRecord)
      jest.spyOn(redisCacheService, 'set').mockImplementation()
      const result = await settingService.get()
      expect(result).toBe(databaseRecord)
    })

    test('returns config data (if present) if data service does not have any data', async () => {
      jest.spyOn(redisCacheService, 'get').mockImplementation()
      jest.spyOn(settingDataService, 'sqlFindOne').mockImplementation()
      jest.spyOn(redisCacheService, 'set').mockImplementation()
      const result = await settingService.get()
      expect(result).toStrictEqual({ questionTimeLimit: undefined, loadingTimeLimit: undefined, checkTimeLimit: undefined, isPostAdminEndDateUnavailable: false })
    })
  })

  describe('update', () => {
    test('records the setting change in the settingsLog table', async () => {
      const updateResult = { rowsAffected: 1 }
      jest.spyOn(settingDataService, 'sqlUpdate').mockResolvedValue(updateResult)
      jest.spyOn(settingLogDataService, 'sqlCreate').mockResolvedValue(updateResult)
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      await settingService.update(1, 2, 3, 4)
      expect(settingDataService.sqlUpdate).toHaveBeenCalled()
      expect(settingLogDataService.sqlCreate).toHaveBeenCalled()
    })

    test('should call redisCacheService.drop after a successful database transmission', async () => {
      const updateResult = { rowsAffected: 1 }
      jest.spyOn(settingDataService, 'sqlUpdate').mockResolvedValue(updateResult)
      jest.spyOn(settingLogDataService, 'sqlCreate').mockResolvedValue(updateResult)
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      await settingService.update(1, 2, 3, 4)
      expect(redisCacheService.drop).toHaveBeenCalledWith(settingsRedisKey)
    })
  })
})
