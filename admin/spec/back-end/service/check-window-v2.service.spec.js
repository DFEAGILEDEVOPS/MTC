'use strict'

const moment = require('moment')
const { v4: uuidv4 } = require('uuid')
const checkWindowDataService = require('../../../services/data-access/check-window.data.service')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const dateService = require('../../../services/date.service')
const MtcCheckWindowNotFoundError = require('../../../error-types/MtcCheckWindowNotFoundError')

describe('check-window-v2.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getCheckWindow', () => {
    let urlSlug
    beforeEach(() => {
      urlSlug = uuidv4().toUpperCase()
    })

    test('should get check window based on urlSlug', async () => {
      jest.spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug').mockResolvedValue({ name: 'Check window' })
      const result = await checkWindowV2Service.getCheckWindow(urlSlug)
      expect(result).toEqual({ name: 'Check window' })
    })

    test('should throw an MtcCheckWindowNotFound error type if urlSlug is empty', async () => {
      jest.spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug').mockImplementation()

      // Test 1: it rejects
      await expect(checkWindowV2Service.getCheckWindow(undefined)).rejects.toThrowError(MtcCheckWindowNotFoundError)

      // Test 2: with the correct error
      try {
        await checkWindowV2Service.getCheckWindow(undefined)
      } catch (error) {
        expect(error.message).toEqual('Check window url slug is not valid')
        expect(error.userMessage).toEqual('The service manager must configure a valid check window')
      }
      expect(checkWindowDataService.sqlFindOneByUrlSlug).not.toHaveBeenCalled()
    })

    test('should throw an MtcCheckWindowNotFound error type if urlSlug is invalid', async () => {
      jest.spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug').mockImplementation()
      urlSlug = urlSlug.substring(0, urlSlug.length - 1)
      // Test 1: it rejects
      await expect(checkWindowV2Service.getCheckWindow(urlSlug)).rejects.toThrowError(MtcCheckWindowNotFoundError)

      // Test 2: the error
      try {
        await checkWindowV2Service.getCheckWindow(urlSlug)
      } catch (error) {
        expect(error.message).toEqual('Check window url slug is not valid')
        expect(error.userMessage).toEqual('The service manager must configure a valid check window')
      }
      expect(checkWindowDataService.sqlFindOneByUrlSlug).not.toHaveBeenCalled()
    })
  })

  describe('getCheckWindows', () => {
    test('should get check windows names with statuses and provide canRemove boolean flag', async () => {
      jest.spyOn(checkWindowDataService, 'sqlFindCheckWindowsWithStatus').mockResolvedValue([
        {
          name: 'name1',
          status: 'Inactive'
        },
        {
          name: 'name2',
          status: 'Active'
        },
        {
          name: 'name3',
          status: 'Past'
        }
      ])
      const result = await checkWindowV2Service.getCheckWindows()
      expect(result[0].canRemove).toBeTruthy()
      expect(result[1].canRemove).toBeFalsy()
      expect(result[2].canRemove).toBeFalsy()
    })
  })

  describe('getPresentAndFutureCheckWindows', () => {
    test('should get check windows that are not in the past', async () => {
      jest.spyOn(checkWindowDataService, 'sqlFindCheckWindowsWithStatusAndFormCountByType').mockResolvedValue([
        {
          name: 'name1',
          status: 'Inactive'
        },
        {
          name: 'name2',
          status: 'Active'
        },
        {
          name: 'name3',
          status: 'Past'
        }
      ])
      const result = await checkWindowV2Service.getPresentAndFutureCheckWindows()
      expect(result).toEqual([
        {
          name: 'name1',
          status: 'Inactive'
        },
        {
          name: 'name2',
          status: 'Active'
        }
      ])
    })
  })

  describe('markDeleted', () => {
    let urlSlug

    beforeEach(() => {
      urlSlug = uuidv4().toUpperCase()
    })

    test('should mark the check window as deleted when it is in the future', async () => {
      jest.spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug').mockResolvedValue({
        id: 1,
        adminStartDate: moment.utc().add(1, 'days'),
        adminEndDate: moment.utc().add(2, 'days')
      })
      jest.spyOn(checkWindowDataService, 'sqlDeleteCheckWindow').mockImplementation()
      await checkWindowV2Service.markDeleted(urlSlug)
      expect(checkWindowDataService.sqlDeleteCheckWindow).toHaveBeenCalled()
    })

    test('should throw an error if check window url slug is not found', async () => {
      jest.spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug').mockResolvedValue({
        id: 1,
        adminStartDate: moment.utc().add(1, 'days'),
        adminEndDate: moment.utc().add(2, 'days')
      })
      jest.spyOn(checkWindowDataService, 'sqlDeleteCheckWindow').mockImplementation()
      await expect(checkWindowV2Service.markDeleted('')).rejects.toThrow('Check window url slug is not valid')
      expect(checkWindowDataService.sqlDeleteCheckWindow).not.toHaveBeenCalled()
    })

    test('should throw an error if check window url slug is invalid', async () => {
      jest.spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug').mockResolvedValue({
        id: 1,
        adminStartDate: moment.utc().add(1, 'days'),
        adminEndDate: moment.utc().add(2, 'days')
      })
      jest.spyOn(checkWindowDataService, 'sqlDeleteCheckWindow').mockImplementation()
      urlSlug = urlSlug.substring(0, urlSlug.length - 1)
      await expect(checkWindowV2Service.markDeleted(urlSlug)).rejects.toThrow('Check window url slug is not valid')
      expect(checkWindowDataService.sqlDeleteCheckWindow).not.toHaveBeenCalled()
    })

    test('should throw an error if check window is not found', async () => {
      jest.spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug').mockResolvedValue(undefined)
      jest.spyOn(checkWindowDataService, 'sqlDeleteCheckWindow').mockImplementation()
      await expect(checkWindowV2Service.markDeleted(urlSlug)).rejects.toThrow('Check window not found')
      expect(checkWindowDataService.sqlDeleteCheckWindow).not.toHaveBeenCalled()
    })

    test('should throw an error if check window is active', async () => {
      jest.spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug').mockResolvedValue({
        id: 1,
        adminStartDate: moment.utc().subtract(1, 'days'),
        adminEndDate: moment.utc().add(2, 'days')
      })
      jest.spyOn(checkWindowDataService, 'sqlDeleteCheckWindow').mockImplementation()
      await expect(checkWindowV2Service.markDeleted(urlSlug)).rejects.toThrow('Deleting an active check window is not permitted')
      expect(checkWindowDataService.sqlDeleteCheckWindow).not.toHaveBeenCalled()
    })

    test('should throw an error if check window is a past one', async () => {
      jest.spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug').mockResolvedValue({
        id: 1,
        adminStartDate: moment.utc().subtract(4, 'days'),
        adminEndDate: moment.utc().subtract(2, 'days')
      })
      jest.spyOn(checkWindowDataService, 'sqlDeleteCheckWindow').mockImplementation()
      await expect(checkWindowV2Service.markDeleted(urlSlug)).rejects.toThrow('Deleting an past check window is not permitted')
      expect(checkWindowDataService.sqlDeleteCheckWindow).not.toHaveBeenCalled()
    })
  })

  describe('prepareSubmissionData', () => {
    test('should prepare data for submission', async () => {
      jest.spyOn(dateService, 'createUTCFromDayMonthYear').mockReturnValue(moment.utc())
      const requestData = {
        checkWindowName: 'Check window'
      }
      const checkWindowData = checkWindowV2Service.prepareSubmissionData(requestData)
      expect(Object.keys(checkWindowData).length).toBe(7)
      expect(checkWindowData.adminStartDate).toBeDefined()
      expect(checkWindowData.adminEndDate).toBeDefined()
      expect(checkWindowData.familiarisationCheckStartDate).toBeDefined()
      expect(checkWindowData.familiarisationCheckEndDate).toBeDefined()
      expect(checkWindowData.checkStartDate).toBeDefined()
      expect(checkWindowData.checkEndDate).toBeDefined()
      expect(dateService.createUTCFromDayMonthYear).toHaveBeenCalledTimes(6)
      expect(checkWindowData.adminEndDate.format('HH:mm:ss')).toBe('23:59:59')
      expect(checkWindowData.checkEndDate.format('HH:mm:ss')).toBe('23:59:59')
      expect(checkWindowData.familiarisationCheckEndDate.format('HH:mm:ss')).toBe('23:59:59')
    })
  })
  describe('getActiveCheckWindow', () => {
    test('should cache successive calls on prod', async () => {
      const nodeEnvSaved = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      jest.spyOn(checkWindowDataService, 'sqlFindActiveCheckWindow').mockResolvedValue({ mock: 'yes' })
      await checkWindowV2Service.getActiveCheckWindow(true)
      await checkWindowV2Service.getActiveCheckWindow()
      await checkWindowV2Service.getActiveCheckWindow()
      expect(checkWindowDataService.sqlFindActiveCheckWindow).toHaveBeenCalledTimes(1)
      process.env.NODE_ENV = nodeEnvSaved
    })

    test('should NOT cache successive calls on non-prod', async () => {
      const nodeEnvSaved = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      jest.spyOn(checkWindowDataService, 'sqlFindActiveCheckWindow').mockResolvedValue({ mock: 'yes' })
      await checkWindowV2Service.getActiveCheckWindow(true)
      await checkWindowV2Service.getActiveCheckWindow()
      await checkWindowV2Service.getActiveCheckWindow()
      expect(checkWindowDataService.sqlFindActiveCheckWindow).toHaveBeenCalledTimes(3)
      process.env.NODE_ENV = nodeEnvSaved
    })

    test('only caches for 60 seconds on prod envs', async () => {
      const now = new Date()
      const nodeEnvSaved = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      jest.spyOn(checkWindowDataService, 'sqlFindActiveCheckWindow').mockResolvedValue({ mock: 'yes' })
      await checkWindowV2Service.getActiveCheckWindow(true) // 1st call

      const nowPlus60 = new Date(now.getTime() + 60.010 * 1000)
      Date.now = jest.fn().mockReturnValue(nowPlus60)
      await checkWindowV2Service.getActiveCheckWindow() // 2nd call

      const nowPlus119 = new Date(nowPlus60 + 59.998 * 1000)
      Date.now = jest.fn().mockReturnValue(nowPlus119)
      await checkWindowV2Service.getActiveCheckWindow() // cached response

      expect(checkWindowDataService.sqlFindActiveCheckWindow).toHaveBeenCalledTimes(2)
      process.env.NODE_ENV = nodeEnvSaved
    })
  })
})
