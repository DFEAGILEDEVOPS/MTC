'use strict'
/* global describe, it, expect spyOn */

const pupilAccessArrangementsService = require('../../../services/pupil-access-arrangements.service')
const pupilService = require('../../../services/pupil.service')
const pupilAccessArrangementsEditService = require('../../../services/pupil-access-arrangements-edit.service')

describe('pupilAccessArrangementsEditService', () => {
  describe('getEditData', () => {
    it('calls pupilAccessArrangementsService getPupilEditFormData when request data are not present and returns edit form data', async () => {
      spyOn(pupilAccessArrangementsService, 'getPupilEditFormData').and.returnValue({})
      spyOn(pupilService, 'fetchOnePupilBySlug')
      const requestData = {}
      const formData = await pupilAccessArrangementsEditService.getEditData(requestData, 'pupilUrlSlug', 9991001)
      expect(pupilAccessArrangementsService.getPupilEditFormData).toHaveBeenCalled()
      expect(pupilService.fetchOnePupilBySlug).not.toHaveBeenCalled()
      expect(formData).toEqual({})
    })
    it('calls pupilService fetchOnePupilBySlug when request data are present and returns additional missing properties', async () => {
      spyOn(pupilAccessArrangementsService, 'getPupilEditFormData')
      spyOn(pupilService, 'fetchOnePupilBySlug').and.returnValue({ foreName: 'foreName', lastName: 'lastName' })
      const requestData = { urlSlug: 'urlSlug' }
      const formData = await pupilAccessArrangementsEditService.getEditData(requestData, 'pupilUrlSlug', 9991001)
      expect(pupilAccessArrangementsService.getPupilEditFormData).not.toHaveBeenCalled()
      expect(pupilService.fetchOnePupilBySlug).toHaveBeenCalled()
      expect(formData).toEqual({ urlSlug: 'urlSlug', foreName: 'foreName', lastName: 'lastName' })
    })
  })
})
