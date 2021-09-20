'use strict'

/* global describe expect jest test */

const restartDataService = require('../../../services/data-access/restart-v2.data.service')
const pupilIdentificationFlagService = require('../../../services/pupil-identification-flag.service')

// sut
const restartV2Service = require('../../../services/restart-v2.service')

describe('restart-v2.service', () => {
  describe('#getPupilsEligibleForRestart', () => {
    test('calls the restart data service to find the pupils', async () => {
      const schoolId = 42
      jest.spyOn(restartDataService, 'sqlFindPupilsEligibleForRestart').mockResolvedValue([])
      await restartV2Service.getPupilsEligibleForRestart(schoolId)
      expect(restartDataService.sqlFindPupilsEligibleForRestart).toHaveBeenCalledTimes(1)
    })

    test('makes a call to the pupil identification service to get display information for the GUI', async () => {
      const schoolId = 42
      jest.spyOn(pupilIdentificationFlagService, 'sortAndAddIdentificationFlags')
      jest.spyOn(restartDataService, 'sqlFindPupilsEligibleForRestart').mockResolvedValue([])
      await restartV2Service.getPupilsEligibleForRestart(schoolId)
      expect(pupilIdentificationFlagService.sortAndAddIdentificationFlags).toHaveBeenCalledTimes(1)
    })
  })
})
