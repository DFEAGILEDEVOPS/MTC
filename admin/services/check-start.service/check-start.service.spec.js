'use strict'

/* global describe it expect beforeEach spyOn fail */

const moment = require('moment')

const azureQueueService = require('../azure-queue.service')
const checkDataService = require('../data-access/check.data.service')
const checkFormAllocationDataService = require('../data-access/check-form-allocation.data.service')
const checkFormDataService = require('../data-access/check-form.data.service')
const checkFormService = require('../check-form.service')
const checkStartDataService = require('./data-access/check-start.data.service')
const checkStartService = require('./check-start.service')
const checkStateService = require('../check-state.service')
const checkWindowDataService = require('../data-access/check-window.data.service')
const checkWindowMock = require('../../spec/back-end/mocks/check-window-2')
const configService = require('../config.service')
const logger = require('../log.service.js').getLogger()
const pinGenerationDataService = require('../data-access/pin-generation.data.service')
const pinGenerationV2Service = require('../pin-generation-v2.service')
const pupilDataService = require('../data-access/pupil.data.service')
const sasTokenService = require('../sas-token.service')
const prepareCheckService = require('../prepare-check.service')
const featureToggles = require('feature-toggles')

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
    { mock: 'message', checkCode: '1A' },
    { mock: 'message', checkCode: '2A' },
    { mock: 'message', checkCode: '3A' }
  ]
  const mockNewChecks = [
    { id: 1, checkCode: '1A', pupil_id: 1 },
    { id: 1, checkCode: '2A', pupil_id: 2 },
    { id: 3, checkCode: '3A', pupil_id: 3 }
  ]

  describe('#prepareCheck2', () => {
    beforeEach(() => {
      spyOn(checkWindowDataService, 'sqlFindOneCurrent').and.returnValue(Promise.resolve(checkWindowMock))
      spyOn(checkFormService, 'getAllFormsForCheckWindowByType').and.returnValue(Promise.resolve([]))
      spyOn(checkDataService, 'sqlFindAllFormsUsedByPupils').and.returnValue(Promise.resolve([]))
      spyOn(pinGenerationDataService, 'sqlCreateBatch').and.returnValue(Promise.resolve({ insertId: [1, 2, 3] }))
      spyOn(checkStartService, 'initialisePupilCheck').and.returnValue(Promise.resolve(mockPreparedCheck))
      spyOn(pinGenerationDataService, 'sqlFindChecksForPupilsById').and.returnValue(Promise.resolve(mockNewChecks))
      spyOn(pupilDataService, 'sqlUpdateTokensBatch').and.returnValue(Promise.resolve())
      spyOn(checkStartService, 'createPupilCheckPayloads').and.returnValue(mockPreparedCheckQueueMessages)
      spyOn(azureQueueService, 'addMessageAsync')
      spyOn(checkStartDataService, 'sqlFindPupilsEligibleForPinGenerationById').and.returnValue(Promise.resolve(mockPupils))
      spyOn(pinGenerationV2Service, 'checkAndUpdateRestarts').and.returnValue(Promise.resolve())
      spyOn(configService, 'getBatchConfig').and.returnValue(
        {
          1: configService.getBaseConfig(),
          2: configService.getBaseConfig(),
          3: configService.getBaseConfig()
        })
      spyOn(checkStartDataService, 'sqlStoreBatchConfigs')
      spyOn(checkStartDataService, 'updatePupilState')
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
        spyOn(logger, 'error')
        await checkStartService.prepareCheck2(pupilIdsHackAttempt, dfeNumber, schoolId, true)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Validation failed')
      }
    })

    it('calls sqlFindPupilsEligibleForPinGenerationById to find pupils', async () => {
      await checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, true)
      expect(checkStartDataService.sqlFindPupilsEligibleForPinGenerationById).toHaveBeenCalledTimes(1)
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
      expect(azureQueueService.addMessageAsync).toHaveBeenCalledTimes(2)
    })

    it('adds config to the database', async () => {
      await checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, true)
      // pupil status re-calc and prepare-check queues
      expect(checkStartDataService.sqlStoreBatchConfigs).toHaveBeenCalledTimes(1)
    })

    it('uses prepare check service when toggle enabled', async () => {
      spyOn(featureToggles, 'isFeatureEnabled').and.returnValue(true)
      spyOn(prepareCheckService, 'prepareChecks')
      await checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, true)
      expect(prepareCheckService.prepareChecks).toHaveBeenCalledTimes(1)
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
        expect({}.hasOwnProperty.call(c, 'pupil_id'))
        expect({}.hasOwnProperty.call(c, 'checkWindow_id'))
        expect({}.hasOwnProperty.call(c, 'checkForm_id'))
      })
    })

    describe('for test pins', () => {
      it('returns a check object, ready to be inserted into the db', async () => {
        spyOn(checkFormService, 'allocateCheckForm').and.returnValue(checkFormMock)
        const c = await service.initialisePupilCheck(1, checkWindowMock, undefined, undefined, false)
        expect({}.hasOwnProperty.call(c, 'pupil_id'))
        expect({}.hasOwnProperty.call(c, 'checkWindow_id'))
        expect({}.hasOwnProperty.call(c, 'checkForm_id'))
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
      expect({}.hasOwnProperty.call(arg, 'pupilLoginDate')).toBeTruthy()
      expect(moment.isMoment(arg.pupilLoginDate)).toBeTruthy()
    })

    it('returns an object with checkCode and questions props', async () => {
      spyOn(checkDataService, 'sqlFindOneForPupilLogin').and.returnValue(preparedCheckMock)
      spyOn(checkFormDataService, 'sqlGetActiveForm').and.returnValue([checkFormMock])
      spyOn(checkDataService, 'sqlUpdate')
      spyOn(checkStateService, 'changeState').and.returnValue(Promise.resolve())
      const res = await service.pupilLogin(1)
      expect({}.hasOwnProperty.call(res, 'checkCode')).toBeTruthy()
      expect({}.hasOwnProperty.call(res, 'questions')).toBeTruthy()
    })
  })

  describe('#prepareCheckQueueMessages', () => {
    const mockCheckFormAllocationLive = require('../../spec/back-end/mocks/check-form-allocation')
    const mockCheckFormAllocationFamiliarisation = require('../../spec/back-end/mocks/check-form-allocation-familiarisation')
    beforeEach(() => {
      spyOn(configService, 'getBatchConfig').and.returnValue({ 1: configService.getBaseConfig() })
      spyOn(sasTokenService, 'generateSasToken').and.callFake((s) => {
        return {
          token: '<someToken',
          url: `http://localhost/${s}`
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
          await checkStartService.createPupilCheckPayloads()
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toBe('checkIds is not defined')
        }
      })

      it('throws an error if the check form allocation ID param is not an array', async () => {
        try {
          await checkStartService.createPupilCheckPayloads({})
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toBe('checkIds must be an array')
        }
      })

      it('makes a call to fetch the check form allocations from the db', async () => {
        await checkStartService.createPupilCheckPayloads([1], 1)
        expect(checkFormAllocationDataService.sqlFindByIdsHydrated).toHaveBeenCalled()
      })

      it('prepares the question data', async () => {
        const res = await checkStartService.createPupilCheckPayloads([1], 1)
        expect(checkFormService.prepareQuestionData).toHaveBeenCalled()
        expect(Object.keys(res[0].questions[0])).toContain('order')
        expect(Object.keys(res[0].questions[0])).toContain('factor1')
        expect(Object.keys(res[0].questions[0])).toContain('factor2')
      })
      it('does generate and include check complete & check submit sas tokens when live checks are generated', async () => {
        const res = await checkStartService.createPupilCheckPayloads([1], 1)
        expect(sasTokenService.generateSasToken).toHaveBeenCalledTimes(5)
        expect(Object.keys(res[0].tokens)).toContain('checkComplete')
        expect(Object.keys(res[0].tokens)).toContain('checkSubmit')
      })
    })
    describe('when familiarisation checks are generated', () => {
      beforeEach(() => {
        spyOn(checkFormAllocationDataService, 'sqlFindByIdsHydrated').and.returnValue(Promise.resolve([mockCheckFormAllocationFamiliarisation]))
      })
      it('does not generate and include check complete sas token when familiarisation checks are generated', async () => {
        const res = await checkStartService.createPupilCheckPayloads([1], 1)
        expect(sasTokenService.generateSasToken).toHaveBeenCalledTimes(3)
        expect(Object.keys(res[0].tokens)).not.toContain('checkComplete')
      })
    })
  })
})
