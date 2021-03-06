'use strict'
/* global beforeEach describe expect it fail spyOn jest */

const moment = require('moment')
const { v4: uuidv4 } = require('uuid')
const checkWindowDataService = require('../../../services/data-access/check-window.data.service')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const dateService = require('../../../services/date.service')
const MtcCheckWindowNotFoundError = require('../../../error-types/MtcCheckWindowNotFoundError')

describe('check-window-v2.service', () => {
  describe('getCheckWindow', () => {
    let urlSlug
    beforeEach(() => {
      urlSlug = uuidv4().toUpperCase()
    })
    it('should get check window based on urlSlug', async () => {
      spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug').and.returnValue({ name: 'Check window' })
      const result = await checkWindowV2Service.getCheckWindow(urlSlug)
      expect(result).toEqual({ name: 'Check window' })
    })
    it('should throw an MtcCheckWindowNotFound error type if urlSlug is empty', async () => {
      spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug')
      try {
        await checkWindowV2Service.getCheckWindow(undefined)
        fail()
      } catch (error) {
        expect(error instanceof MtcCheckWindowNotFoundError).toBeTruthy()
        expect(error.name).toBe('MtcCheckWindowNotFound')
        expect(error.message).toEqual('Check window url slug is not valid')
        expect(error.userMessage).toEqual('The service manager must configure a valid check window')
      }
      expect(checkWindowDataService.sqlFindOneByUrlSlug).not.toHaveBeenCalled()
    })
    it('should throw an MtcCheckWindowNotFound error type if urlSlug is invalid', async () => {
      spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug')
      urlSlug = urlSlug.substring(0, urlSlug.length - 1)
      try {
        await checkWindowV2Service.getCheckWindow(urlSlug)
        fail()
      } catch (error) {
        expect(error instanceof MtcCheckWindowNotFoundError).toBeTruthy()
        expect(error.name).toBe('MtcCheckWindowNotFound')
        expect(error.message).toEqual('Check window url slug is not valid')
        expect(error.userMessage).toEqual('The service manager must configure a valid check window')
      }
      expect(checkWindowDataService.sqlFindOneByUrlSlug).not.toHaveBeenCalled()
    })
  })
  describe('getCheckWindows', () => {
    it('should get check windows names with statuses and provide canRemove boolean flag', async () => {
      spyOn(checkWindowDataService, 'sqlFindCheckWindowsWithStatus').and.returnValue([
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
    it('should get check windows that are not in the past', async () => {
      spyOn(checkWindowDataService, 'sqlFindCheckWindowsWithStatusAndFormCountByType').and.returnValue([
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
    it('should mark the check window as deleted when it is in the future', async () => {
      spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug').and.returnValue({
        id: 1,
        adminStartDate: moment.utc().add(1, 'days'),
        adminEndDate: moment.utc().add(2, 'days')
      })
      spyOn(checkWindowDataService, 'sqlDeleteCheckWindow')
      await checkWindowV2Service.markDeleted(urlSlug)
      expect(checkWindowDataService.sqlDeleteCheckWindow).toHaveBeenCalled()
    })
    it('should throw an error if check window url slug is not found', async () => {
      spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug').and.returnValue({
        id: 1,
        adminStartDate: moment.utc().add(1, 'days'),
        adminEndDate: moment.utc().add(2, 'days')
      })
      spyOn(checkWindowDataService, 'sqlDeleteCheckWindow')
      try {
        await checkWindowV2Service.markDeleted('')
        fail()
      } catch (error) {
        expect(error.message).toBe('Check window url slug is not valid')
      }
      expect(checkWindowDataService.sqlDeleteCheckWindow).not.toHaveBeenCalled()
    })
    it('should throw an error if check window url slug is invalid', async () => {
      spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug').and.returnValue({
        id: 1,
        adminStartDate: moment.utc().add(1, 'days'),
        adminEndDate: moment.utc().add(2, 'days')
      })
      spyOn(checkWindowDataService, 'sqlDeleteCheckWindow')
      urlSlug = urlSlug.substring(0, urlSlug.length - 1)
      try {
        await checkWindowV2Service.markDeleted(urlSlug)
        fail()
      } catch (error) {
        expect(error.message).toBe('Check window url slug is not valid')
      }
      expect(checkWindowDataService.sqlDeleteCheckWindow).not.toHaveBeenCalled()
    })
    it('should throw an error if check window is not found', async () => {
      spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug').and.returnValue(undefined)
      spyOn(checkWindowDataService, 'sqlDeleteCheckWindow')
      try {
        await checkWindowV2Service.markDeleted(urlSlug)
        fail()
      } catch (error) {
        expect(error.message).toBe('Check window not found')
      }
      expect(checkWindowDataService.sqlDeleteCheckWindow).not.toHaveBeenCalled()
    })
    it('should throw an error if check window is active', async () => {
      spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug').and.returnValue({
        id: 1,
        adminStartDate: moment.utc().subtract(1, 'days'),
        adminEndDate: moment.utc().add(2, 'days')
      })
      spyOn(checkWindowDataService, 'sqlDeleteCheckWindow')
      try {
        await checkWindowV2Service.markDeleted(urlSlug)
        fail()
      } catch (error) {
        expect(error.message).toBe('Deleting an active check window is not permitted')
      }
      expect(checkWindowDataService.sqlDeleteCheckWindow).not.toHaveBeenCalled()
    })
    it('should throw an error if check window is a past one', async () => {
      spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug').and.returnValue({
        id: 1,
        adminStartDate: moment.utc().subtract(4, 'days'),
        adminEndDate: moment.utc().subtract(2, 'days')
      })
      spyOn(checkWindowDataService, 'sqlDeleteCheckWindow')
      try {
        await checkWindowV2Service.markDeleted(urlSlug)
        fail()
      } catch (error) {
        expect(error.message).toBe('Deleting an past check window is not permitted')
      }
      expect(checkWindowDataService.sqlDeleteCheckWindow).not.toHaveBeenCalled()
    })
  })
  describe('prepareSubmissionData', () => {
    it('should prepare data for submission', async () => {
      spyOn(dateService, 'createUTCFromDayMonthYear').and.returnValue(moment.utc())
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
    it('should cache successive calls on prod', async () => {
      const nodeEnvSaved = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      spyOn(checkWindowDataService, 'sqlFindActiveCheckWindow').and.returnValue(Promise.resolve({ mock: 'yes' }))
      await checkWindowV2Service.getActiveCheckWindow(true)
      await checkWindowV2Service.getActiveCheckWindow()
      await checkWindowV2Service.getActiveCheckWindow()
      expect(checkWindowDataService.sqlFindActiveCheckWindow).toHaveBeenCalledTimes(1)
      process.env.NODE_ENV = nodeEnvSaved
    })

    it('should NOT cache successive calls on non-prod', async () => {
      const nodeEnvSaved = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      spyOn(checkWindowDataService, 'sqlFindActiveCheckWindow').and.returnValue(Promise.resolve({ mock: 'yes' }))
      await checkWindowV2Service.getActiveCheckWindow(true)
      await checkWindowV2Service.getActiveCheckWindow()
      await checkWindowV2Service.getActiveCheckWindow()
      expect(checkWindowDataService.sqlFindActiveCheckWindow).toHaveBeenCalledTimes(3)
      process.env.NODE_ENV = nodeEnvSaved
    })

    it('only caches for 60 seconds on prod envs', async () => {
      const now = new Date()
      const nodeEnvSaved = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      spyOn(checkWindowDataService, 'sqlFindActiveCheckWindow').and.returnValue(Promise.resolve({ mock: 'yes' }))
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
