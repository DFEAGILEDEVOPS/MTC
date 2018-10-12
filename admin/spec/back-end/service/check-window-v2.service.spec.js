'use strict'
/* global describe expect it fail spyOn */

const moment = require('moment')
const checkWindowDataService = require('../../../services/data-access/check-window.data.service')
const checkWindowV2Service = require('../../../services/check-window-v2.service')

describe('check-window-v2.service', () => {
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
  describe('markDeleted', () => {
    it('should mark the check window as deleted when it is in the future', async () => {
      spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug').and.returnValue({
        id: 1,
        adminStartDate: moment.utc().add(1, 'days'),
        adminEndDate: moment.utc().add(2, 'days')
      })
      spyOn(checkWindowDataService, 'sqlDeleteCheckWindow')
      const result = await checkWindowV2Service.markDeleted('urlSlug')
      expect(result).toEqual({ type: 'info', message: 'Check window deleted.' })
      expect(checkWindowDataService.sqlDeleteCheckWindow).toHaveBeenCalled()
    })
    it('should throw an error if check window is not found', async () => {
      spyOn(checkWindowDataService, 'sqlFindOneByUrlSlug').and.returnValue(undefined)
      spyOn(checkWindowDataService, 'sqlDeleteCheckWindow')
      try {
        await checkWindowV2Service.markDeleted('urlSlug')
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
        await checkWindowV2Service.markDeleted('urlSlug')
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
        await checkWindowV2Service.markDeleted('urlSlug')
        fail()
      } catch (error) {
        expect(error.message).toBe('Deleting an past check window is not permitted')
      }
      expect(checkWindowDataService.sqlDeleteCheckWindow).not.toHaveBeenCalled()
    })
  })
})
