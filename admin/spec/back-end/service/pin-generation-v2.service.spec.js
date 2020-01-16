'use strict'

/* global describe it spyOn expect */
const pinGenerationDataService = require('../../../services/data-access/pin-generation.data.service')
const pupilIdentificationFlagService = require('../../../services/pupil-identification-flag.service')

// sut
const pinGenerationV2Service = require('../../../services/pin-generation-v2.service')

describe('pin-generation-v2.service', () => {
  describe('#getPupilsEligibleForPinGeneration', () => {
    it('makes a call to the data service to fetch the pupils', async () => {
      spyOn(pinGenerationDataService, 'sqlFindEligiblePupilsBySchool')
      spyOn(pupilIdentificationFlagService, 'addIdentificationFlags')
      const schoolId = 42
      await pinGenerationV2Service.getPupilsEligibleForPinGeneration(schoolId)
      expect(pinGenerationDataService.sqlFindEligiblePupilsBySchool).toHaveBeenCalledTimes(1)
    })
    it('makes a call to the pupil identification service to get display information for the GUI', async () => {
      spyOn(pinGenerationDataService, 'sqlFindEligiblePupilsBySchool')
      spyOn(pupilIdentificationFlagService, 'addIdentificationFlags')
      const schoolId = 42
      await pinGenerationV2Service.getPupilsEligibleForPinGeneration(schoolId)
      expect(pupilIdentificationFlagService.addIdentificationFlags).toHaveBeenCalledTimes(1)
    })
  })

  describe('#getPupilsWithActivePins', () => {
    it('makes a call to the data service to get pupils with active pins', async () => {
      spyOn(pinGenerationDataService, 'sqlFindPupilsWithActivePins')
      spyOn(pupilIdentificationFlagService, 'addIdentificationFlags')
      const schoolId = 42
      await pinGenerationV2Service.getPupilsWithActivePins(schoolId, 'live')
    })

    it('makes a call to the pupil identification service to get display information for the GUI', async () => {
      spyOn(pinGenerationDataService, 'sqlFindPupilsWithActivePins')
      spyOn(pupilIdentificationFlagService, 'addIdentificationFlags')
      const schoolId = 42
      await pinGenerationV2Service.getPupilsWithActivePins(schoolId, 'live')
      expect(pupilIdentificationFlagService.addIdentificationFlags).toHaveBeenCalledTimes(1)
    })
  })
})
