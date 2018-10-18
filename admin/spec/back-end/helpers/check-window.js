/* global describe, expect, it, spyOn */
const moment = require('moment')
const uuid = require('uuid/v4')

const checkWindowHelper = require('../../../helpers/check-window')
const dateService = require('../../../services/date.service')

describe('checkWindowHelper', () => {
  describe('getEditViewData', () => {
    it('fetch the checkWindow record and shape the data for the UI', () => {
      const checkWindowData = {
        id: 1,
        urlSlug: uuid(),
        adminStartDate: moment.utc().add(1, 'days'),
        adminEndDate: moment.utc().add(10, 'days'),
        familiarisationCheckStartDate: moment.utc().add(2, 'days'),
        familiarisationCheckEndDate: moment.utc().add(5, 'days'),
        checkStartDate: moment.utc().add(3, 'days'),
        checkEndDate: moment.utc().add(5, 'days')
      }
      const checkWindowViewData = checkWindowHelper.getEditViewData(checkWindowData)
      expect(checkWindowViewData.adminStartDateDisabled).toBeFalsy()
      expect(checkWindowViewData.adminEndDateDisabled).toBeFalsy()
      expect(checkWindowViewData.familiarisationCheckStartDateDisabled).toBeFalsy()
      expect(checkWindowViewData.familiarisationCheckEndDateDisabled).toBeFalsy()
      expect(checkWindowViewData.liveCheckStartDateDisabled).toBeFalsy()
      expect(checkWindowViewData.liveCheckEndDateDisabled).toBeFalsy()
      expect(checkWindowViewData.adminEndDateDisabled).toBeFalsy()
      expect(checkWindowViewData.familiarisationCheckPeriodDisabled).toBeFalsy()
      expect(checkWindowViewData.liveCheckPeriodDisabled).toBeFalsy()
      expect(checkWindowViewData.pastCheckWindow).toBeFalsy()
    })
  })
  describe('prepareSubmissionData', () => {
    it('should prepare data for submission', async () => {
      spyOn(dateService, 'createUTCFromDayMonthYear').and.returnValue(moment.utc())
      const requestData = {
        checkWindowName: 'Check window'
      }
      const checkWindowData = checkWindowHelper.prepareSubmissionData(requestData)
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
