/* global describe, expect, it */
const moment = require('moment')

const checkFormPresenter = require('../../../helpers/check-form-presenter')
const dateService = require('../../../services/date.service')

describe('checkFormPresenter', () => {
  describe('getPresentationListData', () => {
    it('shapes the data in the appropriate format for the presentation view', () => {
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
    it('fetches data for presenting single check form', () => {
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
    it('returns flash message data for the list view', () => {
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
    it('returns check window list data formatted', () => {
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
    it('returns check window data formatted', () => {
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
        checkStartDate: dateService.formatFullGdsDate(moment.utc().subtract(3, 'days')),
        checkEndDate: dateService.formatFullGdsDate(moment.utc().add(2, 'days')),
        checkFormTypeTitle: 'Multiplication tables check'
      })
    })
  })
})
