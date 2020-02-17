'use strict'

/* global describe it expect beforeEach spyOn fail */
const checkFormAllocationDataService = require('../data-access/check-form-allocation.data.service')
const checkFormService = require('../check-form.service')
const checkStartDataService = require('./data-access/check-start.data.service')
const checkStartService = require('./check-start.service')
const checkWindowMock = require('../../spec/back-end/mocks/check-window-2')
const configService = require('../config.service')
const logger = require('../log.service.js').getLogger()
const pinGenerationDataService = require('../data-access/pin-generation.data.service')
const prepareCheckService = require('../prepare-check.service')
const pupilDataService = require('../data-access/pupil.data.service')
const sasTokenService = require('../sas-token.service')
const redisCacheService = require('../data-access/redis-cache.service')
const pinValidityGeneratorService = require('../pin-validity-generator.service')

const checkFormMock = {
  id: 100,
  name: 'MTC0100',
  isDeleted: false,
  formData: '[ { "f1" : 2, "f2" : 5},{"f1" : 11,"f2" : 2    }]'
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
  const mockNewChecks = [
    { id: 1, checkCode: '1A', pupil_id: 1 },
    { id: 1, checkCode: '2A', pupil_id: 2 },
    { id: 3, checkCode: '3A', pupil_id: 3 }
  ]
  const mockCreatePupilCheckPayloads = [
    {
      checkCode: '1A',
      schoolPin: 'pin',
      pupilPin: 'pin',
      pupil: {},
      school: {},
      tokens: {},
      questions: {},
      config: {}
    },
    {
      checkCode: '2A',
      schoolPin: 'pin',
      pupilPin: 'pin',
      pupil: {},
      school: {},
      tokens: {},
      questions: {},
      config: {}
    },
    {
      checkCode: '3A',
      schoolPin: 'pin',
      pupilPin: 'pin',
      pupil: {},
      school: {},
      tokens: {},
      questions: {},
      config: {}
    }
  ]

  describe('#prepareCheck2', () => {
    beforeEach(() => {
      spyOn(checkStartDataService, 'sqlFindPupilsEligibleForPinGenerationById').and.returnValue(Promise.resolve(mockPupils))
      spyOn(checkStartDataService, 'sqlFindAllFormsAssignedToCheckWindow').and.returnValue(Promise.resolve([]))
      spyOn(checkStartDataService, 'sqlFindAllFormsUsedByPupils').and.returnValue(Promise.resolve([]))
      spyOn(pinGenerationDataService, 'sqlCreateBatch').and.returnValue(Promise.resolve({ insertId: [1, 2, 3] }))
      spyOn(checkStartService, 'initialisePupilCheck').and.returnValue(Promise.resolve(mockPreparedCheck))
      spyOn(pinGenerationDataService, 'sqlFindChecksForPupilsById').and.returnValue(Promise.resolve(mockNewChecks))
      spyOn(pupilDataService, 'sqlUpdateTokensBatch').and.returnValue(Promise.resolve())
      spyOn(checkStartService, 'createPupilCheckPayloads').and.returnValue(mockCreatePupilCheckPayloads)
      spyOn(prepareCheckService, 'prepareChecks') // don't put checks in redis
      spyOn(configService, 'getBatchConfig').and.returnValue(
        {
          1: configService.getBaseConfig(),
          2: configService.getBaseConfig(),
          3: configService.getBaseConfig()
        })
      spyOn(checkStartDataService, 'sqlStoreBatchConfigs')
      spyOn(redisCacheService, 'get').and.returnValue(Promise.resolve())
      spyOn(redisCacheService, 'set').and.returnValue(Promise.resolve())
    })

    it('throws an error if the pupilIds are not provided', async () => {
      try {
        await checkStartService.prepareCheck2(undefined, dfeNumber, schoolId, true, checkWindowMock)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('pupilIds is required')
      }
    })

    it('throws an error if the schoolId is not provided', async () => {
      try {
        await checkStartService.prepareCheck2(pupilIds, dfeNumber, undefined, true, checkWindowMock)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('schoolId is required')
      }
    })

    it('throws an error if provided with pupilIds that are not a part of the school', async () => {
      try {
        spyOn(logger, 'error')
        await checkStartService.prepareCheck2(pupilIdsHackAttempt, dfeNumber, schoolId, true, checkWindowMock)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Validation failed')
      }
    })

    it('calls sqlFindPupilsEligibleForPinGenerationById to find pupils', async () => {
      await checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, true, null, checkWindowMock)
      expect(checkStartDataService.sqlFindPupilsEligibleForPinGenerationById).toHaveBeenCalledTimes(1)
    })

    it('calls initialisePupilCheck to randomly select a check form', async () => {
      await checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, true, null, checkWindowMock)
      expect(checkStartService.initialisePupilCheck).toHaveBeenCalledTimes(mockPupils.length)
      expect(pinGenerationDataService.sqlCreateBatch).toHaveBeenCalledTimes(1)
    })

    it('adds config to the database', async () => {
      await checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, true, null, checkWindowMock)
      // pupil status re-calc and prepare-check queues
      expect(checkStartDataService.sqlStoreBatchConfigs).toHaveBeenCalledTimes(1)
    })
  })

  describe('#initialisePupilCheck', () => {
    beforeEach(() => {
      spyOn(pinValidityGeneratorService, 'generatePinTimestamp')
    })
    it('calls generatePinTimestamp to generate pinExpiresAt for a pupil', async () => {
      spyOn(checkFormService, 'allocateCheckForm').and.returnValue(checkFormMock)
      await service.initialisePupilCheck(1, checkWindowMock, [], [], true)
      expect(pinValidityGeneratorService.generatePinTimestamp).toHaveBeenCalledTimes(1)
    })
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

  describe('#prepareCheckQueueMessages', () => {
    const mockCheckFormAllocationLive = require('../../spec/back-end/mocks/check-form-allocation')
    const mockCheckFormAllocationFamiliarisation = require('../../spec/back-end/mocks/check-form-allocation-familiarisation')
    beforeEach(() => {
      spyOn(configService, 'getBatchConfig').and.returnValue({ 1: configService.getBaseConfig() })
      spyOn(sasTokenService, 'generateSasToken').and.callFake((s) => {
        return {
          token: '<someToken',
          url: `http://localhost/${s}`,
          queueName: 'abc'
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
        expect(sasTokenService.generateSasToken).toHaveBeenCalledTimes(4)
        expect(Object.keys(res[0].tokens)).toContain('checkComplete')
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
