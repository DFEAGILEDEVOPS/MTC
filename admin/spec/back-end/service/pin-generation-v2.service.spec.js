'use strict'
/* global describe it spyOn expect beforeEach */
const moment = require('moment')
const pinGenerationDataService = require('../../../services/data-access/pin-generation.data.service')
const pupilIdentificationFlagService = require('../../../services/pupil-identification-flag.service')

// sut
const pinGenerationV2Service = require('../../../services/pin-generation-v2.service')

describe('pin-generation-v2.service', () => {
  describe('#getPupilsEligibleForPinGeneration', () => {
    beforeEach(() => {
      const pupils = [
        { id: 1, lastName: 'Smith', foreName: 'Alfred', middleNames: '', dateOfBirth: moment('2011-01-22T09:00:00') },
        { id: 2, lastName: 'Smith', foreName: 'Bertie', middleNames: '', dateOfBirth: moment('2011-01-22T09:00:00') },
        { id: 3, lastName: 'Aardvark', foreName: 'Alfred', middleNames: 'John', dateOfBirth: moment('2011-01-22T09:00:00') },
        { id: 4, lastName: 'Aardvark', foreName: 'Alfred', middleNames: 'George', dateOfBirth: moment('2011-01-22T09:00:00') }
      ]
      spyOn(pinGenerationDataService, 'sqlFindEligiblePupilsBySchool').and.returnValue(pupils)
    })

    it('makes a call to the data service to fetch the pupils', async () => {
      spyOn(pupilIdentificationFlagService, 'addIdentificationFlags')
      const schoolId = 42
      await pinGenerationV2Service.getPupilsEligibleForPinGeneration(schoolId)
      expect(pinGenerationDataService.sqlFindEligiblePupilsBySchool).toHaveBeenCalledTimes(1)
    })

    it('makes a call to the pupil identification service to get display information for the GUI', async () => {
      spyOn(pupilIdentificationFlagService, 'addIdentificationFlags')
      const schoolId = 42
      await pinGenerationV2Service.getPupilsEligibleForPinGeneration(schoolId)
      expect(pupilIdentificationFlagService.addIdentificationFlags).toHaveBeenCalledTimes(1)
    })

    it('sorts the pupils', async () => {
      const schoolId = 42
      const result = await pinGenerationV2Service.getPupilsEligibleForPinGeneration(schoolId, true)
      expect(result[0].id).toBe(4)
      expect(result[1].id).toBe(3)
      expect(result[2].id).toBe(1)
      expect(result[3].id).toBe(2)
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
