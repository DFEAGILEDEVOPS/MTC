'use strict'

const pupilAccessArrangementsService = require('../../../services/pupil-access-arrangements.service')
const pupilService = require('../../../services/pupil.service')
const pupilAccessArrangementsEditService = require('../../../services/pupil-access-arrangements-edit.service')

describe('pupilAccessArrangementsEditService', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getEditData', () => {
    test('calls pupilAccessArrangementsService getPupilEditFormData when request data are not present and returns edit form data', async () => {
      jest.spyOn(pupilAccessArrangementsService, 'getPupilEditFormData').mockResolvedValue({})
      jest.spyOn(pupilService, 'fetchOnePupilBySlug').mockImplementation()
      const requestData = {}
      const formData = await pupilAccessArrangementsEditService.getEditData(requestData, 'pupilUrlSlug', 9991001)
      expect(pupilAccessArrangementsService.getPupilEditFormData).toHaveBeenCalled()
      expect(pupilService.fetchOnePupilBySlug).not.toHaveBeenCalled()
      expect(formData).toEqual({})
    })
    test('calls pupilService fetchOnePupilBySlug when request data are present and returns additional missing properties', async () => {
      jest.spyOn(pupilAccessArrangementsService, 'getPupilEditFormData').mockImplementation()
      jest.spyOn(pupilService, 'fetchOnePupilBySlug').mockResolvedValue({ foreName: 'foreName', lastName: 'lastName' })
      const requestData = { urlSlug: 'urlSlug' }
      const formData = await pupilAccessArrangementsEditService.getEditData(requestData, 'pupilUrlSlug', 9991001)
      expect(pupilAccessArrangementsService.getPupilEditFormData).not.toHaveBeenCalled()
      expect(pupilService.fetchOnePupilBySlug).toHaveBeenCalled()
      expect(formData).toEqual({ urlSlug: 'urlSlug', foreName: 'foreName', lastName: 'lastName' })
    })
  })
})
