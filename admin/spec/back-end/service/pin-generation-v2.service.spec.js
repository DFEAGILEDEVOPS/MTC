'use strict'

/* global describe it spyOn expect fail */
const logger = require('../../../services/log.service').getLogger()
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

  describe('#checkAndUpdateRestarts', () => {
    it('returns early if there arent any restarts', async () => {
      spyOn(pinGenerationDataService, 'sqlFindChecksForPupilsById')
      spyOn(logger, 'info') // hush the service
      const schoolId = 42
      const pupils = [
        { id: 1, isRestart: false },
        { id: 2, isRestart: false },
        { id: 3, isRestart: false }
      ]
      const checkIds = [1, 2, 3]
      await pinGenerationV2Service.checkAndUpdateRestarts(schoolId, pupils, checkIds)
      expect(pinGenerationDataService.sqlFindChecksForPupilsById).not.toHaveBeenCalled()
    })
  })
  it('retrieves all the checks if there are any restarts', async () => {
    spyOn(pinGenerationDataService, 'updatePupilRestartsWithCheckInformation')
    spyOn(pinGenerationDataService, 'sqlFindChecksForPupilsById').and.returnValue([
      { id: 1, pupil_id: 1 },
      { id: 2, pupil_id: 2 },
      { id: 3, pupil_id: 3 }
    ])
    const schoolId = 42
    const pupils = [
      { id: 1, isRestart: false },
      { id: 2, isRestart: true, pupilRestart_id: 9 },
      { id: 3, isRestart: false }
    ]
    const checkIds = [1, 2, 3]
    await pinGenerationV2Service.checkAndUpdateRestarts(schoolId, pupils, checkIds)
    expect(pinGenerationDataService.sqlFindChecksForPupilsById).toHaveBeenCalledTimes(1)
  })
  it('Logs an error in the data service if it errors while retrieving all the checks ', async () => {
    spyOn(pinGenerationDataService, 'updatePupilRestartsWithCheckInformation')
    spyOn(pinGenerationDataService, 'sqlFindChecksForPupilsById').and.returnValue(Promise.reject(new Error('mock error')))
    spyOn(logger, 'error')
    const schoolId = 42
    const pupils = [
      { id: 1, isRestart: false },
      { id: 2, isRestart: true, pupilRestart_id: 9 },
      { id: 3, isRestart: false }
    ]
    const checkIds = [1, 2, 3]
    try {
      await pinGenerationV2Service.checkAndUpdateRestarts(schoolId, pupils, checkIds)
      fail()
    } catch (error) {
      expect(logger.error).toHaveBeenCalled()
    }
  })
  it('calls updatePupilRestartsWithCheckInformation to write the restart information to the db', async () => {
    spyOn(pinGenerationDataService, 'updatePupilRestartsWithCheckInformation')
    spyOn(pinGenerationDataService, 'sqlFindChecksForPupilsById').and.returnValue([
      { id: 1, pupil_id: 1 },
      { id: 2, pupil_id: 2 },
      { id: 3, pupil_id: 3 }
    ])
    const schoolId = 42
    const pupils = [
      { id: 1, isRestart: false },
      { id: 2, isRestart: true, pupilRestart_id: 9 },
      { id: 3, isRestart: false }
    ]
    const checkIds = [1, 2, 3]
    await pinGenerationV2Service.checkAndUpdateRestarts(schoolId, pupils, checkIds)
    expect(pinGenerationDataService.updatePupilRestartsWithCheckInformation).toHaveBeenCalledTimes(1)
    expect(pinGenerationDataService.updatePupilRestartsWithCheckInformation).toHaveBeenCalledWith([
      { pupilRestartId: 9, checkId: 2 }
    ])
  })
  it('Logs an error in the data service if it errors while calling updatePupilRestartsWithCheckInformation', async () => {
    spyOn(pinGenerationDataService, 'updatePupilRestartsWithCheckInformation').and.returnValue(Promise.reject(new Error('mock error')))
    spyOn(pinGenerationDataService, 'sqlFindChecksForPupilsById').and.returnValue([
      { id: 1, pupil_id: 1 },
      { id: 2, pupil_id: 2 },
      { id: 3, pupil_id: 3 }
    ])
    spyOn(logger, 'error')
    const schoolId = 42
    const pupils = [
      { id: 1, isRestart: false },
      { id: 2, isRestart: true, pupilRestart_id: 9 },
      { id: 3, isRestart: false }
    ]
    const checkIds = [1, 2, 3]
    try {
      await pinGenerationV2Service.checkAndUpdateRestarts(schoolId, pupils, checkIds)
    } catch (error) {
      expect(logger.error).toHaveBeenCalled()
    }
  })
})
