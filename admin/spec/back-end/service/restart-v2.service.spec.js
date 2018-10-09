'use strict'

/* global describe, it, expect */

const restartDataService = require('../../../services/data-access/restart-v2.data.service')
const pupilIdentificationFlagService = require('../../../services/pupil-identification-flag.service')

// sut
const restartV2Service = require('../../../services/restart-v2.service')

describe('restart-v2.service', () =>  {
  describe('#getPupilsEligibleForRestart',  () => {
    it('calls the restart data service to find the pupils', async () => {
      const schoolId = 42
      spyOn(restartDataService, 'sqlFindPupilsEligibleForRestart').and.returnValue([])
      await restartV2Service.getPupilsEligibleForRestart(schoolId)
      expect(restartDataService.sqlFindPupilsEligibleForRestart).toHaveBeenCalledTimes(1)
    })
    it('makes a call to the pupil identification service to get display information for the GUI', async () => {
      const schoolId = 42
      spyOn(pupilIdentificationFlagService, 'addIdentificationFlags')
      spyOn(restartDataService, 'sqlFindPupilsEligibleForRestart').and.returnValue([])
      await restartV2Service.getPupilsEligibleForRestart(schoolId)
      expect(pupilIdentificationFlagService.addIdentificationFlags).toHaveBeenCalledTimes(1)
    })
  })
})