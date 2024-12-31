const moment = require('moment')
const { v4: uuidv4 } = require('uuid')

const checkWindowPresenter = require('../../../helpers/check-window-presenter')

describe('checkWindowHelper', () => {
  describe('getViewModelData', () => {
    test('fetch the checkWindow record and shape the data for the UI', () => {
      const checkWindowData = {
        id: 1,
        urlSlug: uuidv4(),
        adminStartDate: moment.utc().add(1, 'days'),
        adminEndDate: moment.utc().add(10, 'days'),
        familiarisationCheckStartDate: moment.utc().add(2, 'days'),
        familiarisationCheckEndDate: moment.utc().add(5, 'days'),
        checkStartDate: moment.utc().add(3, 'days'),
        checkEndDate: moment.utc().add(5, 'days')
      }
      const checkWindowViewData = checkWindowPresenter.getViewModelData(checkWindowData)
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
    test('should have adminStartDateDisabled as false if admin start date is today', () => {
      const checkWindowData = {
        id: 1,
        urlSlug: uuidv4(),
        adminStartDate: moment.utc(),
        adminEndDate: moment.utc().add(10, 'days'),
        familiarisationCheckStartDate: moment.utc().add(2, 'days'),
        familiarisationCheckEndDate: moment.utc().add(5, 'days'),
        checkStartDate: moment.utc().add(3, 'days'),
        checkEndDate: moment.utc().add(5, 'days')
      }
      const checkWindowViewData = checkWindowPresenter.getViewModelData(checkWindowData)
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
    test('should have adminStartDateDisabled as true if admin start date is yesterday', () => {
      const checkWindowData = {
        id: 1,
        urlSlug: uuidv4(),
        adminStartDate: moment.utc().subtract(1, 'days'),
        adminEndDate: moment.utc().add(10, 'days'),
        familiarisationCheckStartDate: moment.utc().add(2, 'days'),
        familiarisationCheckEndDate: moment.utc().add(5, 'days'),
        checkStartDate: moment.utc().add(3, 'days'),
        checkEndDate: moment.utc().add(5, 'days')
      }
      const checkWindowViewData = checkWindowPresenter.getViewModelData(checkWindowData)
      expect(checkWindowViewData.adminStartDateDisabled).toBeTruthy()
      expect(checkWindowViewData.adminEndDateDisabled).toBeFalsy()
      expect(checkWindowViewData.familiarisationCheckStartDateDisabled).toBeFalsy()
      expect(checkWindowViewData.familiarisationCheckEndDateDisabled).toBeFalsy()
      expect(checkWindowViewData.liveCheckStartDateDisabled).toBeFalsy()
      expect(checkWindowViewData.liveCheckEndDateDisabled).toBeFalsy()
      expect(checkWindowViewData.familiarisationCheckPeriodDisabled).toBeFalsy()
      expect(checkWindowViewData.liveCheckPeriodDisabled).toBeFalsy()
      expect(checkWindowViewData.pastCheckWindow).toBeFalsy()
    })
    test('should have adminEndDateDisabled as false if admin end date is today', () => {
      const checkWindowData = {
        id: 1,
        urlSlug: uuidv4(),
        adminStartDate: moment.utc().subtract(10, 'days'),
        adminEndDate: moment.utc(),
        familiarisationCheckStartDate: moment.utc().subtract(5, 'days'),
        familiarisationCheckEndDate: moment.utc().subtract(2, 'days'),
        checkStartDate: moment.utc().subtract(4, 'days'),
        checkEndDate: moment.utc().subtract(2, 'days')
      }
      const checkWindowViewData = checkWindowPresenter.getViewModelData(checkWindowData)
      expect(checkWindowViewData.adminStartDateDisabled).toBeTruthy()
      expect(checkWindowViewData.adminEndDateDisabled).toBeFalsy()
      expect(checkWindowViewData.familiarisationCheckStartDateDisabled).toBeTruthy()
      expect(checkWindowViewData.familiarisationCheckEndDateDisabled).toBeFalsy()
      expect(checkWindowViewData.liveCheckStartDateDisabled).toBeTruthy()
      expect(checkWindowViewData.liveCheckEndDateDisabled).toBeFalsy()
      expect(checkWindowViewData.familiarisationCheckPeriodDisabled).toBeFalsy()
      expect(checkWindowViewData.liveCheckPeriodDisabled).toBeFalsy()
    })
    test('should have adminEndDateDisabled as false, as the SM should always be able to edit it, even if the admin end' +
      ' date is yesterday', () => {
      const checkWindowData = {
        id: 1,
        urlSlug: uuidv4(),
        adminStartDate: moment.utc().subtract(10, 'days'),
        adminEndDate: moment.utc().subtract(1, 'days'),
        familiarisationCheckStartDate: moment.utc().subtract(5, 'days'),
        familiarisationCheckEndDate: moment.utc().subtract(2, 'days'),
        checkStartDate: moment.utc().subtract(4, 'days'),
        checkEndDate: moment.utc().subtract(2, 'days')
      }
      const checkWindowViewData = checkWindowPresenter.getViewModelData(checkWindowData)
      expect(checkWindowViewData.adminStartDateDisabled).toBeTruthy()
      expect(checkWindowViewData.adminEndDateDisabled).toBeFalsy()
      expect(checkWindowViewData.familiarisationCheckStartDateDisabled).toBeTruthy()
      expect(checkWindowViewData.familiarisationCheckEndDateDisabled).toBeFalsy()
      expect(checkWindowViewData.liveCheckStartDateDisabled).toBeTruthy()
      expect(checkWindowViewData.liveCheckEndDateDisabled).toBeFalsy()
      expect(checkWindowViewData.familiarisationCheckPeriodDisabled).toBeFalsy()
      expect(checkWindowViewData.liveCheckPeriodDisabled).toBeFalsy()
      expect(checkWindowViewData.pastCheckWindow).toBeTruthy()
    })
  })
})
