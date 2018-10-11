'use strict'
/* global describe expect it spyOn */

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
})
