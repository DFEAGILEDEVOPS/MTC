'use strict'
/* global describe expect it fail spyOn */

const moment = require('moment')

const checkWindowDataService = require('../../../services/data-access/check-window.data.service')
const checkWindowV2AddService = require('../../../services/check-window-v2-add.service')
const dateService = require('../../../services/date.service')

describe('check-window-v2-add.service', () => {
  describe('submit', () => {
    it('should process data passed, perform insertion and return a flash message', async () => {
      const requestData = { checkWindowName: 'Check window' }
      spyOn(checkWindowV2AddService, 'processData').and.returnValue({ name: 'Check window' })
      spyOn(checkWindowDataService, 'sqlCreate')
      let flashMessage
      try {
        flashMessage = await checkWindowV2AddService.submit(requestData)
      } catch (error) {
        fail()
      }
      expect(flashMessage).toBe('Check window has been created')
      expect(checkWindowV2AddService.processData).toHaveBeenCalled()
      expect(checkWindowDataService.sqlCreate).toHaveBeenCalled()
    })
  })
  describe('processData', () => {
    it('should process check window data and return a db suitable format', async () => {
      spyOn(dateService, 'createUTCFromDayMonthYear').and.returnValue(moment.utc())
      const requestData = { checkWindowName: 'Check window' }
      const checkWindowData = checkWindowV2AddService.processData(requestData)
      expect(Object.keys(checkWindowData).length).toBe(7)
      expect(checkWindowData.adminStartDate).toBeDefined()
      expect(checkWindowData.adminEndDate).toBeDefined()
      expect(checkWindowData.familiarisationCheckStartDate).toBeDefined()
      expect(checkWindowData.familiarisationCheckEndDate).toBeDefined()
      expect(checkWindowData.checkStartDate).toBeDefined()
      expect(checkWindowData.checkEndDate).toBeDefined()
      expect(dateService.createUTCFromDayMonthYear).toHaveBeenCalledTimes(6)
      expect(checkWindowData.checkEndDate.format('HH:mm:ss')).toBe('22:59:59')
      expect(checkWindowData.familiarisationCheckEndDate.format('HH:mm:ss')).toBe('22:59:59')
    })
  })
})
