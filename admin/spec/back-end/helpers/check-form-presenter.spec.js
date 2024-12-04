const moment = require('moment')

const checkFormPresenter = require('../../../helpers/check-form-presenter')
const dateService = require('../../../services/date.service')

describe('checkFormPresenter', () => {
  describe('getPresentationListData', () => {
    test('shapes the data in the appropriate format for the presentation view', () => {
      const checkFormData = [{
        name: 'name',
        isLiveCheckForm: true,
        createdAt: moment.utc().subtract(1, 'days'),
        checkWindow_id: null,
        urlSlug: 'urlSlug'
      }]
      const result = checkFormPresenter.getPresentationListData(checkFormData)
      expect(result).toEqual(
        [{
          checkFormName: 'name',
          checkFormType: 'MTC',
          createdAt: moment.utc().subtract(1, 'days').format('YYYY-MM-DD'),
          canRemoveCheckForm: true,
          urlSlug: 'urlSlug'
        }])
    })
  })
  describe('getPresentationCheckFormData', () => {
    test('fetches data for presenting single check form', () => {
      const checkFormData = {
        name: 'name',
        isLiveCheckForm: true,
        createdAt: moment.utc().subtract(1, 'days'),
        checkWindow_id: 1,
        checkWindowName: 'checkWindowName',
        urlSlug: 'urlSlug',
        checkWindowAdminStartDate: moment.utc().subtract(5, 'days'),
        checkWindowAdminEndDate: moment.utc().add(5, 'days'),
        formData: JSON.stringify([{ f1: 1, f2: 2 }])
      }
      const result = checkFormPresenter.getPresentationCheckFormData(checkFormData)
      expect(result).toEqual(
        {
          checkFormName: 'name',
          checkFormType: 'Live',
          createdAt: checkFormData.createdAt.format('DD MMMM YYYY'),
          checkWindowAdminStartDate: checkFormData.checkWindowAdminStartDate,
          checkWindowAdminEndDate: checkFormData.checkWindowAdminEndDate,
          canRemoveCheckForm: false,
          checkWindowName: 'checkWindowName',
          formData: JSON.parse(checkFormData.formData),
          urlSlug: 'urlSlug'
        })
    })
  })
  describe('getFlashMessageData', () => {
    test('returns flash message data for the list view', () => {
      const uploadData = [{
        filename: 'filename.csv'
      }]
      const result = checkFormPresenter.getFlashMessageData(uploadData)
      expect(result).toEqual({
        message: 'Successfully uploaded 1 form',
        checkForms: [{ checkFormName: 'filename' }]
      })
    })
  })
  describe('getPresentationCheckWindowListData', () => {
    test('returns check window list data formatted', () => {
      const checkWindows = [{
        name: 'name',
        urlSlug: 'urlSlug',
        FamiliarisationCheckFormCount: 1,
        LiveCheckFormCount: 2,
        familiarisationCheckStartDate: moment.utc().subtract(5, 'days'),
        familiarisationCheckEndDate: moment.utc().add(2, 'days'),
        checkStartDate: moment.utc().subtract(3, 'days'),
        checkEndDate: moment.utc().add(2, 'days')
      }]
      const result = checkFormPresenter.getPresentationCheckWindowListData(checkWindows)
      expect(result).toEqual([{
        name: 'name',
        urlSlug: 'urlSlug',
        familiarisationCheckFormCount: 1,
        liveCheckFormCount: 2,
        familiarisationCheckStartDate: dateService.formatFullGdsDate(moment.utc().subtract(5, 'days')),
        familiarisationCheckEndDate: dateService.formatFullGdsDate(moment.utc().add(2, 'days')),
        checkStartDate: dateService.formatFullGdsDate(moment.utc().subtract(3, 'days')),
        checkEndDate: dateService.formatFullGdsDate(moment.utc().add(2, 'days'))
      }])
    })
  })
  describe('getPresentationCheckWindowData', () => {
    test('returns check window data formatted', () => {
      const checkWindow = {
        name: 'name',
        urlSlug: 'urlSlug',
        familiarisationCheckStartDate: moment.utc().subtract(5, 'days'),
        familiarisationCheckEndDate: moment.utc().add(2, 'days'),
        checkStartDate: moment.utc().subtract(3, 'days'),
        checkEndDate: moment.utc().add(2, 'days')
      }
      const result = checkFormPresenter.getPresentationCheckWindowData(checkWindow, 'live')
      expect(result).toEqual({
        name: 'name',
        urlSlug: 'urlSlug',
        familiarisationCheckStartDate: dateService.formatFullGdsDate(moment.utc().subtract(5, 'days')),
        familiarisationCheckEndDate: dateService.formatFullGdsDate(moment.utc().add(2, 'days')),
        liveCheckStartDate: dateService.formatFullGdsDate(moment.utc().subtract(3, 'days')),
        liveCheckEndDate: dateService.formatFullGdsDate(moment.utc().add(2, 'days')),
        checkFormTypeTitle: 'Multiplication tables check',
        checkPeriod: 'MTC',
        isBeforeCheckType: false
      })
    })
  })
  describe('getPresentationAvailableFormsData', () => {
    test('returns check window data formatted', () => {
      const availableCheckForms = [{
        name: 'name',
        isLiveCheckForm: true,
        urlSlug: 'urlSlug'
      }]
      const assignedCheckForms = [{
        name: 'name',
        isLiveCheckForm: true,
        urlSlug: 'urlSlug'
      }]
      const result = checkFormPresenter.getPresentationAvailableFormsData(availableCheckForms, assignedCheckForms)
      expect(result).toEqual([{
        name: 'name',
        urlSlug: 'urlSlug',
        checked: true
      }])
    })
  })
  describe('getAssignFormsFlashMessage', () => {
    test('returns appropriate highlight message for the number of check forms assigned to the live check window', () => {
      const checkForms = [{ id: 1 }, { id: 2 }]
      const checkWindowName = 'checkWindowName'
      const checkFormType = 'live'
      const result = checkFormPresenter.getAssignFormsFlashMessage(checkForms, checkWindowName, checkFormType)
      expect(result).toEqual('2 forms have been assigned to checkWindowName, MTC')
    })
    test('returns appropriate highlight message for a single check form that has been assigned to the live check window', () => {
      const checkForms = [{ id: 1 }]
      const checkWindowName = 'checkWindowName'
      const checkFormType = 'live'
      const result = checkFormPresenter.getAssignFormsFlashMessage(checkForms, checkWindowName, checkFormType)
      expect(result).toEqual('1 form has been assigned to checkWindowName, MTC')
    })
    test('returns appropriate highlight message for a single check form that has been assigned to the familiarisation check window', () => {
      const checkForms = [{ id: 1 }]
      const checkWindowName = 'checkWindowName'
      const checkFormType = 'familiarisation'
      const result = checkFormPresenter.getAssignFormsFlashMessage(checkForms, checkWindowName, checkFormType)
      expect(result).toEqual('1 form has been assigned to checkWindowName, Try it out')
    })
    test('returns appropriate highlight message for a single check form that has been unassigned to the familiarisation check window', () => {
      const checkForms = undefined
      const checkWindowName = 'checkWindowName'
      const checkFormType = 'familiarisation'
      const result = checkFormPresenter.getAssignFormsFlashMessage(checkForms, checkWindowName, checkFormType)
      expect(result).toEqual('Check form has been unassigned from checkWindowName, Try it out')
    })
  })
})
