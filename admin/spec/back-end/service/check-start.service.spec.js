'use strict'

/* global describe it expect beforeEach spyOn fail */

const moment = require('moment')
const winston = require('winston')

const azureQueueService = require('../../../services/azure-queue.service')
const checkDataService = require('../../../services/data-access/check.data.service')
const checkFormAllocationDataService = require('../../../services/data-access/check-form-allocation.data.service')
const checkFormDataService = require('../../../services/data-access/check-form.data.service')
const checkFormService = require('../../../services/check-form.service')
const checkStartService = require('../../../services/check-start.service')
const checkStateService = require('../../../services/check-state.service')
const checkWindowDataService = require('../../../services/data-access/check-window.data.service')
const checkWindowMock = require('../mocks/check-window-2')
const configService = require('../../../services/config.service')
const pinGenerationDataService = require('../../../services/data-access/pin-generation.data.service')
const pinGenerationService = require('../../../services/pin-generation.service')
const pinGenerationV2Service = require('../../../services/pin-generation-v2.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const sasTokenService = require('../../../services/sas-token.service')
const checkFormMock = {
  id: 100,
  name: 'MTC0100',
  isDeleted: false,
  formData: '[ { "f1" : 2, "f2" : 5},{"f1" : 11,"f2" : 2    }]'
}
const preparedCheckMock = {
  id: 1,
  checkCode: 'abc-def-ghi',
  checkWindow_id: 2,
  checkForm_id: 3,
  pupil_id: 42,
  pupilLoginDate: null,
  mark: null,
  maxMark: null,
  markedAt: null,
  startedAt: null,
  data: null
}

describe('check-start.service', () => {
  const service = checkStartService
  const dfeNumber = 9991999
  const schoolId = 42

  const mockPupils = [
    { id: 1 },
    { id: 2 },
    { id: 3 }
  ]
  const pupilIds = ['1', '2', '3'] // strings to mimic incoming form params
  const pupilIdsHackAttempt = ['1', '2', '3', '4']
  const mockPreparedCheck = { pupil_id: 1, checkForm_id: 1, checkWindow_id: 1, isLiveCheck: true }
  const mockPreparedCheckQueueMessages = [
    { mock: 'message' },
    { mock: 'message' },
    { mock: 'message' }
  ]

  describe('#prepareCheck', () => {
    beforeEach(() => {
      spyOn(checkWindowDataService, 'sqlFindOneCurrent').and.returnValue(Promise.resolve(checkWindowMock))
      spyOn(pinGenerationService, 'updatePupilPins')
      spyOn(checkStartService, 'initialisePupilCheck').and.returnValue(mockPreparedCheck)
      spyOn(checkDataService, 'sqlCreateBatch')
      spyOn(checkFormService, 'getAllFormsForCheckWindow').and.returnValue(Promise.resolve([]))
      spyOn(checkDataService, 'sqlFindAllFormsUsedByPupils').and.returnValue(Promise.resolve([]))
    })

    describe('for live pins', () => {
      describe('pupil validation', () => {
        beforeEach(() => {
          spyOn(pupilDataService, 'sqlFindByIdAndDfeNumber').and.returnValue(Promise.resolve(mockPupils))
        })

        it('throws an error if schoolId is not provided', async () => {
          try {
            await service.prepareCheck(pupilIds, 1, undefined, 'live')
            fail('expected to throw')
          } catch (error) {
            expect(error.message).toBe('schoolId is required')
          }
        })

        it('throws an error if dfeNumber is not provided', async () => {
          try {
            await service.prepareCheck(pupilIds, undefined, 1, 'live')
            fail('expected to throw')
          } catch (error) {
            expect(error.message).toBe('dfeNumber is required')
          }
        })

        it('finds the current check window', async () => {
          await service.prepareCheck(pupilIds, dfeNumber, schoolId, 'live')
          expect(checkWindowDataService.sqlFindOneCurrent).toHaveBeenCalledTimes(1)
        })

        it('calls initialiseCheck once per pupil', async () => {
          await service.prepareCheck(pupilIds, dfeNumber, schoolId, 'live')
          expect(checkStartService.initialisePupilCheck).toHaveBeenCalledTimes(3)
        })

        it('calls sqlCreateBatch to save the checks', async () => {
          await service.prepareCheck(pupilIds, dfeNumber, schoolId, 'live')
          expect(checkDataService.sqlCreateBatch).toHaveBeenCalledTimes(1)
          const arg = checkDataService.sqlCreateBatch.calls.mostRecent().args[0]
          expect(arg.length).toBe(3)
        })
      })

      describe('pupil validation fails', () => {
        beforeEach(() => {
          spyOn(pupilDataService, 'sqlFindByIdAndDfeNumber').and.returnValue(Promise.resolve(mockPupils))
        })
        it('validates the pupils against the database', async () => {
          // This validation emits a winston.warn() as potentially it is serious, so let's
          // shut it up for the test
          spyOn(winston, 'warn')
          try {
            await service.prepareCheck(pupilIdsHackAttempt, dfeNumber, schoolId, 'live')
            fail('expected to throw')
          } catch (error) {
            expect(error.message).toBe('Validation failed')
          }
        })
      })
    })

    describe('for familiarisation pins', () => {
      describe('pupil validation', () => {
        beforeEach(() => {
          spyOn(pupilDataService, 'sqlFindByIdAndDfeNumber').and.returnValue(Promise.resolve(mockPupils))
        })

        it('throws an error if schoolId is not provided', async () => {
          try {
            await service.prepareCheck(pupilIds, 1, undefined, 'familiarisation')
            fail('expected to throw')
          } catch (error) {
            expect(error.message).toBe('schoolId is required')
          }
        })

        it('throws an error if dfeNumber is not provided', async () => {
          try {
            await service.prepareCheck(pupilIds, undefined, 1, 'familiarisation')
            fail('expected to throw')
          } catch (error) {
            expect(error.message).toBe('dfeNumber is required')
          }
        })

        it('finds the current check window', async () => {
          await service.prepareCheck(pupilIds, dfeNumber, schoolId, 'familiarisation')
          expect(checkWindowDataService.sqlFindOneCurrent).toHaveBeenCalledTimes(1)
        })

        it('calls initialiseCheck once per pupil', async () => {
          await service.prepareCheck(pupilIds, dfeNumber, schoolId, 'familiarisation')
          expect(checkStartService.initialisePupilCheck).toHaveBeenCalledTimes(3)
        })

        it('calls sqlCreateBatch to save the checks', async () => {
          await service.prepareCheck(pupilIds, dfeNumber, schoolId, 'familiarisation')
          expect(checkDataService.sqlCreateBatch).toHaveBeenCalledTimes(1)
          const arg = checkDataService.sqlCreateBatch.calls.mostRecent().args[0]
          expect(arg.length).toBe(3)
        })
      })

      describe('pupil validation fails', () => {
        beforeEach(() => {
          spyOn(pupilDataService, 'sqlFindByIdAndDfeNumber').and.returnValue(Promise.resolve(mockPupils))
        })
        it('validates the pupils against the database', async () => {
          // This validation emits a winston.warn() as potentially it is serious, so let's
          // shut it up for the test
          spyOn(winston, 'warn')
          try {
            await service.prepareCheck(pupilIdsHackAttempt, dfeNumber, schoolId, 'familiarisation')
            fail('expected to throw')
          } catch (error) {
            expect(error.message).toBe('Validation failed')
          }
        })
      })
    })
  })

  describe('#preparecheck2', () => {
    beforeEach(() => {
      spyOn(checkWindowDataService, 'sqlFindOneCurrent').and.returnValue(Promise.resolve(checkWindowMock))
      spyOn(checkFormService, 'getAllFormsForCheckWindow').and.returnValue(Promise.resolve([]))
      spyOn(checkDataService, 'sqlFindAllFormsUsedByPupils').and.returnValue(Promise.resolve([]))
      spyOn(pinGenerationDataService, 'sqlCreateBatch').and.returnValue(Promise.resolve({ insertId: [1, 2, 3] }))
      spyOn(checkStartService, 'initialisePupilCheck').and.returnValue(Promise.resolve(mockPreparedCheck))
      spyOn(pinGenerationDataService, 'sqlFindChecksForPupilsById').and.returnValue(
        Promise.resolve([
          { id: 1, checkCode: '1A', pupil_id: 1 },
          { id: 1, checkCode: '2A', pupil_id: 2 },
          { id: 3, checkCode: '3A', pupil_id: 3 }
        ])
      )
      spyOn(pupilDataService, 'sqlUpdateTokensBatch').and.returnValue(Promise.resolve())
      spyOn(checkStartService, 'prepareCheckQueueMessages').and.returnValue(mockPreparedCheckQueueMessages)
      spyOn(azureQueueService, 'addMessageAsync')
      spyOn(pinGenerationV2Service, 'getPupilsEligibleForPinGenerationById').and.returnValue(Promise.resolve(mockPupils))
      spyOn(pinGenerationV2Service, 'checkAndUpdateRestarts').and.returnValue(Promise.resolve())
    })

    it('throws an error if the pupilIds are not provided', async () => {
      try {
        await checkStartService.prepareCheck2(undefined, dfeNumber, schoolId, true)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('pupilIds is required')
      }
    })

    it('throws an error if the schoolId is not provided', async () => {
      try {
        await checkStartService.prepareCheck2(pupilIds, dfeNumber, undefined, true)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('schoolId is required')
      }
    })

    it('throws an error if provided with pupilIds that are not a part of the school', async () => {
      try {
        spyOn(winston, 'error')
        await checkStartService.prepareCheck2(pupilIdsHackAttempt, dfeNumber, schoolId, true)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Validation failed')
      }
    })

    it('calls getPupilsEligibleForPinGenerationById to find pupils', async () => {
      await checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, true)
      expect(pinGenerationV2Service.getPupilsEligibleForPinGenerationById).toHaveBeenCalledTimes(1)
    })

    it('calls initialisePupilCheck to randomly select a check form', async () => {
      await checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, true)
      expect(checkStartService.initialisePupilCheck).toHaveBeenCalledTimes(mockPupils.length)
      expect(pinGenerationDataService.sqlCreateBatch).toHaveBeenCalledTimes(1)
    })

    it('calls checkAndUpdateRestarts so that pupilRestarts can be updated', async () => {
      await checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, true)
      expect(pinGenerationV2Service.checkAndUpdateRestarts).toHaveBeenCalledTimes(1)
    })

    it('adds messages to the queue', async () => {
      await checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, true)
      // pupil status re-calc and prepare-check queues
      expect(azureQueueService.addMessageAsync).toHaveBeenCalledTimes(1)
    })
  })

  describe('#initialisePupilCheck', () => {
    it('calls allocateCheckForm for a pupil', async () => {
      spyOn(checkFormService, 'allocateCheckForm').and.returnValue(checkFormMock)
      await service.initialisePupilCheck(1, checkWindowMock, [], [], true)
      expect(checkFormService.allocateCheckForm).toHaveBeenCalledTimes(1)
    })

    it('throws an error if a checkform is not returned', async () => {
      spyOn(checkFormService, 'allocateCheckForm').and.returnValue(null)
      try {
        await service.initialisePupilCheck(1, checkWindowMock, [], [], true)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('CheckForm not allocated')
      }
    })

    describe('for live pins', () => {
      it('returns a check object, ready to be inserted into the db', async () => {
        spyOn(checkFormService, 'allocateCheckForm').and.returnValue(checkFormMock)
        const c = await service.initialisePupilCheck(1, checkWindowMock, undefined, undefined, true)
        expect(c.hasOwnProperty('pupil_id'))
        expect(c.hasOwnProperty('checkWindow_id'))
        expect(c.hasOwnProperty('checkForm_id'))
      })
    })

    describe('for test pins', () => {
      it('returns a check object, ready to be inserted into the db', async () => {
        spyOn(checkFormService, 'allocateCheckForm').and.returnValue(checkFormMock)
        const c = await service.initialisePupilCheck(1, checkWindowMock, undefined, undefined, false)
        expect(c.hasOwnProperty('pupil_id'))
        expect(c.hasOwnProperty('checkWindow_id'))
        expect(c.hasOwnProperty('checkForm_id'))
      })
    })
  })

  describe('#pupilLogin', () => {
    it('finds the latest check for the pupil', async () => {
      spyOn(checkDataService, 'sqlFindOneForPupilLogin').and.returnValue(preparedCheckMock)
      spyOn(checkFormDataService, 'sqlGetActiveForm').and.returnValue([checkFormMock])
      spyOn(checkDataService, 'sqlUpdate')
      spyOn(checkStateService, 'changeState').and.returnValue(Promise.resolve())
      await service.pupilLogin(1)
      expect(checkDataService.sqlFindOneForPupilLogin).toHaveBeenCalled()
    })

    it('throws an error if the check is not found', async () => {
      spyOn(checkDataService, 'sqlFindOneForPupilLogin').and.returnValue(null)
      spyOn(checkFormDataService, 'sqlGetActiveForm').and.returnValue([checkFormMock])
      spyOn(checkDataService, 'sqlUpdate')
      spyOn(checkStateService, 'changeState').and.returnValue(Promise.resolve())
      try {
        await service.pupilLogin(1)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Unable to find a prepared check for pupil: 1')
      }
    })

    it('finds the CheckForm for the check', async () => {
      spyOn(checkDataService, 'sqlFindOneForPupilLogin').and.returnValue(preparedCheckMock)
      spyOn(checkFormDataService, 'sqlGetActiveForm').and.returnValue([checkFormMock])
      spyOn(checkDataService, 'sqlUpdate')
      spyOn(checkStateService, 'changeState').and.returnValue(Promise.resolve())
      await service.pupilLogin(1)
      expect(checkFormDataService.sqlGetActiveForm).toHaveBeenCalled()
    })

    it('throws an error if the check form is not found', async () => {
      spyOn(checkDataService, 'sqlFindOneForPupilLogin').and.returnValue(preparedCheckMock)
      spyOn(checkFormDataService, 'sqlGetActiveForm').and.returnValue(null)
      spyOn(checkDataService, 'sqlUpdate')
      spyOn(checkStateService, 'changeState').and.returnValue(Promise.resolve())
      try {
        await service.pupilLogin(1)
      } catch (error) {
        expect(error.message).toBe('CheckForm not found: 3')
      }
    })

    it('calls sqlUpdate to add the pupilLoginDate to the check', async () => {
      spyOn(checkDataService, 'sqlFindOneForPupilLogin').and.returnValue(preparedCheckMock)
      spyOn(checkFormDataService, 'sqlGetActiveForm').and.returnValue([checkFormMock])
      spyOn(checkDataService, 'sqlUpdate')
      spyOn(checkStateService, 'changeState').and.returnValue(Promise.resolve())
      await service.pupilLogin(1)
      expect(checkDataService.sqlUpdate).toHaveBeenCalled()
      const arg = checkDataService.sqlUpdate.calls.mostRecent().args[0]
      expect(arg.hasOwnProperty('pupilLoginDate')).toBeTruthy()
      expect(moment.isMoment(arg.pupilLoginDate)).toBeTruthy()
    })

    it('returns an object with checkCode and questions props', async () => {
      spyOn(checkDataService, 'sqlFindOneForPupilLogin').and.returnValue(preparedCheckMock)
      spyOn(checkFormDataService, 'sqlGetActiveForm').and.returnValue([checkFormMock])
      spyOn(checkDataService, 'sqlUpdate')
      spyOn(checkStateService, 'changeState').and.returnValue(Promise.resolve())
      const res = await service.pupilLogin(1)
      expect(res.hasOwnProperty('checkCode')).toBeTruthy()
      expect(res.hasOwnProperty('questions')).toBeTruthy()
    })
  })

  describe('#prepareCheckQueueMessages', () => {
    const mockCheckFormAllocationLive = require('../mocks/check-form-allocation')
    const mockCheckFormAllocationFamiliarisation = require('../mocks/check-form-allocation-familiarisation')
    const mockConfig = {
      speechSynthesis: false,
      loadingTimeLimit: 3,
      questionTimeLimit: 6
    }
    beforeEach(() => {
      spyOn(configService, 'getConfig').and.returnValue(Promise.resolve(mockConfig))
      spyOn(sasTokenService, 'generateSasToken').and.callFake((s) => {
        return {
          'token': '<someToken',
          'url': `http://localhost/${s}`
        }
      })
      spyOn(checkFormService, 'prepareQuestionData').and.callThrough()
    })
    describe('when live checks are generated', () => {
      beforeEach(() => {
        spyOn(checkFormAllocationDataService, 'sqlFindByIdsHydrated').and.returnValue(Promise.resolve([mockCheckFormAllocationLive]))
      })

      it('throws an error if the check form allocation IDs are not supplied', async () => {
        try {
          await checkStartService.prepareCheckQueueMessages()
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toBe('checkIds is not defined')
        }
      })

      it('throws an error if the check form allocation ID param is not an array', async () => {
        try {
          await checkStartService.prepareCheckQueueMessages({})
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toBe('checkIds must be an array')
        }
      })

      it('makes a call to fetch the check form allocations from the db', async () => {
        await checkStartService.prepareCheckQueueMessages([1])
        expect(checkFormAllocationDataService.sqlFindByIdsHydrated).toHaveBeenCalled()
      })

      it('prepares the question data', async () => {
        const res = await checkStartService.prepareCheckQueueMessages([1])
        expect(checkFormService.prepareQuestionData).toHaveBeenCalled()
        expect(Object.keys(res[0].questions[0])).toContain('order')
        expect(Object.keys(res[0].questions[0])).toContain('factor1')
        expect(Object.keys(res[0].questions[0])).toContain('factor2')
      })
    })
    describe('when familiarisation checks are generated', () => {
      beforeEach(() => {
        spyOn(checkFormAllocationDataService, 'sqlFindByIdsHydrated').and.returnValue(Promise.resolve([mockCheckFormAllocationFamiliarisation]))
      })
      it('does not generate and include check complete sas token when familiarisation checks are generated', async () => {
        const res = await checkStartService.prepareCheckQueueMessages([1])
        expect(sasTokenService.generateSasToken).toHaveBeenCalledTimes(3)
        expect(Object.keys(res[0].tokens)).not.toContain('checkComplete')
      })
    })
  })
})
