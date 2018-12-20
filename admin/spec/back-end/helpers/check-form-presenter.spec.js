/* global describe, expect, it */
const moment = require('moment')

const checkFormPresenter = require('../../../helpers/check-form-presenter')

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
          checkFormType: 'Live',
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
        formData: JSON.stringify([{ f1: 1, f2: 2 }]),
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
  describe('getHighlightData', () => {
    it('returns highlight data for the list view', () => {
      const uploadData = [{
        filename: 'filename.csv'
      }]
      const result = checkFormPresenter.getHighlightData(uploadData)
      expect(result).toEqual({
        message: 'Successfully uploaded 1 form',
        checkForms: [{ checkFormName: 'filename' }]
      })
    })
  })
})
