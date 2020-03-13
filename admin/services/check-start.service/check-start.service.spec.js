'use strict'

/* global describe expect beforeEach spyOn fail test */
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
const queueNameService = require('../queue-name-service')
const schoolPinService = require('./school-pin.service')
const pinService = require('../pin.service')
const config = require('../../config')

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
    { id: 1, check_checkCode: '1A', pupil_id: 1, school_pin: 'abc12xyz' },
    { id: 1, check_checkCode: '2A', pupil_id: 2, school_pin: 'abc12xyz' },
    { id: 3, check_checkCode: '3A', pupil_id: 3, school_pin: 'abc12xyz' }
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

  beforeEach(() => {
    spyOn(sasTokenService, 'generateSasToken').and.callFake((s) => {
      return {
        token: '<someToken>',
        url: `http://localhost/${s}`,
        queueName: 'abc'
      }
    })
  })

  describe('#prepareCheck2', () => {
    beforeEach(() => {
      spyOn(checkStartDataService, 'sqlFindPupilsEligibleForPinGenerationById').and.returnValue(Promise.resolve(mockPupils))
      spyOn(checkStartDataService, 'sqlFindAllFormsAssignedToCheckWindow').and.returnValue(Promise.resolve([]))
      spyOn(checkStartDataService, 'sqlFindAllFormsUsedByPupils').and.returnValue(Promise.resolve([]))

      spyOn(pinGenerationDataService, 'sqlCreateBatch').and.returnValue(Promise.resolve(mockNewChecks))

      spyOn(checkStartService, 'initialisePupilCheck').and.returnValue(Promise.resolve(mockPreparedCheck))
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

    test('throws an error if the pupilIds are not provided', async () => {
      try {
        await checkStartService.prepareCheck2(undefined, dfeNumber, schoolId, true, checkWindowMock)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('pupilIds is required')
      }
    })

    test('throws an error if the schoolId is not provided', async () => {
      try {
        await checkStartService.prepareCheck2(pupilIds, dfeNumber, undefined, true, checkWindowMock)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('schoolId is required')
      }
    })

    test('throws an error if provided with pupilIds that are not a part of the school', async () => {
      try {
        spyOn(logger, 'error')
        await checkStartService.prepareCheck2(pupilIdsHackAttempt, dfeNumber, schoolId, true, checkWindowMock)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Validation failed')
      }
    })

    test('calls sqlFindPupilsEligibleForPinGenerationById to find pupils', async () => {
      await checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, true, null, checkWindowMock)
      expect(checkStartDataService.sqlFindPupilsEligibleForPinGenerationById).toHaveBeenCalledTimes(1)
    })

    test('calls initialisePupilCheck to randomly select a check form', async () => {
      await checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, true, null, checkWindowMock)
      expect(checkStartService.initialisePupilCheck).toHaveBeenCalledTimes(mockPupils.length)
      expect(pinGenerationDataService.sqlCreateBatch).toHaveBeenCalledTimes(1)
    })

    test('adds config to the database', async () => {
      await checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, true, null, checkWindowMock)
      // pupil status re-calc and prepare-check queues
      expect(checkStartDataService.sqlStoreBatchConfigs).toHaveBeenCalledTimes(1)
    })
  })

  describe('prepareCheck2:school password generation', () => {
    beforeEach(() => {
      spyOn(checkStartDataService, 'sqlFindPupilsEligibleForPinGenerationById').and.returnValue(Promise.resolve(mockPupils))
      spyOn(checkStartDataService, 'sqlFindAllFormsAssignedToCheckWindow').and.returnValue(Promise.resolve([]))
      spyOn(checkStartDataService, 'sqlFindAllFormsUsedByPupils').and.returnValue(Promise.resolve([]))
      spyOn(checkStartService, 'initialisePupilCheck').and.returnValue(Promise.resolve(mockPreparedCheck))
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

    test('attempts to generate school pin if error 50001 thrown and setting enabled', async () => {
      spyOn(schoolPinService, 'generateSchoolPin')
      config.FeatureToggles.schoolPinGenFallbackEnabled = true
      spyOn(pinGenerationDataService, 'sqlCreateBatch').and.callFake(() => {
        throw new Error('50001: no school pin found')
      })
      try {
        await checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, true, null, checkWindowMock)
        fail('error should have been thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(schoolPinService.generateSchoolPin).toHaveBeenCalledTimes(1)
        expect(pinGenerationDataService.sqlCreateBatch).toHaveBeenCalledTimes(2)
      }
    })

    test('does not attempt to generate school pin if error 50001 thrown and setting disabled', async () => {
      spyOn(schoolPinService, 'generateSchoolPin')
      config.FeatureToggles.schoolPinGenFallbackEnabled = false
      spyOn(pinGenerationDataService, 'sqlCreateBatch').and.callFake(() => {
        throw new Error('50001: no school pin found')
      })
      try {
        await checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, true, null, checkWindowMock)
        fail('error should have been thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(schoolPinService.generateSchoolPin).not.toHaveBeenCalled()
        expect(pinGenerationDataService.sqlCreateBatch).toHaveBeenCalledTimes(1)
      }
    })

    test('does not attempt to generate school pin if error.number is not 50001', async () => {
      spyOn(schoolPinService, 'generateSchoolPin')
      config.FeatureToggles.schoolPinGenFallbackEnabled = true
      spyOn(pinGenerationDataService, 'sqlCreateBatch').and.callFake(() => {
        const err = new Error()
        err.number = 49999
        throw err
      })
      try {
        await checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, true, null, checkWindowMock)
        fail('error should have been thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(schoolPinService.generateSchoolPin).toHaveBeenCalledTimes(0)
        expect(pinGenerationDataService.sqlCreateBatch).toHaveBeenCalledTimes(1)
      }
    })

    test('does not attempt to generate school pin if sqlCreateBatch does not error', async () => {
      spyOn(schoolPinService, 'generateSchoolPin')
      const checksWithNoSchoolPins = [
        { id: 1, check_checkCode: '1A', pupil_id: 1, school_pin: 'aaa11aaa' },
        { id: 1, check_checkCode: '2A', pupil_id: 2, school_pin: 'aaa11aaa' },
        { id: 3, check_checkCode: '3A', pupil_id: 3, school_pin: 'aaa11aaa' }
      ]
      spyOn(pinGenerationDataService, 'sqlCreateBatch').and.callFake(() => {
        return Promise.resolve(checksWithNoSchoolPins)
      })
      await checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, true, null, checkWindowMock)
      expect(schoolPinService.generateSchoolPin).not.toHaveBeenCalled()
    })
  })

  describe('#initialisePupilCheck', () => {
    beforeEach(() => {
      spyOn(pinService, 'generatePinTimestamp')
    })
    test('calls generatePinTimestamp to generate pinExpiresAt for a pupil', async () => {
      spyOn(checkFormService, 'allocateCheckForm').and.returnValue(checkFormMock)
      await service.initialisePupilCheck(1, checkWindowMock, [], [], true)
      expect(pinService.generatePinTimestamp).toHaveBeenCalledTimes(1)
    })
    test('calls allocateCheckForm for a pupil', async () => {
      spyOn(checkFormService, 'allocateCheckForm').and.returnValue(checkFormMock)
      await service.initialisePupilCheck(1, checkWindowMock, [], [], true)
      expect(checkFormService.allocateCheckForm).toHaveBeenCalledTimes(1)
    })

    test('throws an error if a checkform is not returned', async () => {
      spyOn(checkFormService, 'allocateCheckForm').and.returnValue(null)
      try {
        await service.initialisePupilCheck(1, checkWindowMock, [], [], true)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('CheckForm not allocated')
      }
    })

    describe('for live pins', () => {
      test('returns a check object, ready to be inserted into the db', async () => {
        spyOn(checkFormService, 'allocateCheckForm').and.returnValue(checkFormMock)
        const c = await service.initialisePupilCheck(1, checkWindowMock, undefined, undefined, true)
        expect({}.hasOwnProperty.call(c, 'pupil_id'))
        expect({}.hasOwnProperty.call(c, 'checkWindow_id'))
        expect({}.hasOwnProperty.call(c, 'checkForm_id'))
      })
    })

    describe('for test pins', () => {
      test('returns a check object, ready to be inserted into the db', async () => {
        spyOn(checkFormService, 'allocateCheckForm').and.returnValue(checkFormMock)
        const c = await service.initialisePupilCheck(1, checkWindowMock, undefined, undefined, false)
        expect({}.hasOwnProperty.call(c, 'pupil_id'))
        expect({}.hasOwnProperty.call(c, 'checkWindow_id'))
        expect({}.hasOwnProperty.call(c, 'checkForm_id'))
      })
    })
  })

  describe('#createPupilCheckPayloads', () => {
    const mockCheckFormAllocationLive = require('../../spec/back-end/mocks/check-form-allocation')
    beforeEach(() => {
      spyOn(configService, 'getBatchConfig').and.returnValue({ 1: configService.getBaseConfig() })
      spyOn(checkFormService, 'prepareQuestionData').and.callThrough()
    })

    describe('when live checks are generated', () => {
      beforeEach(() => {
        spyOn(sasTokenService, 'getTokens').and.returnValue([
          { queueName: queueNameService.NAMES.CHECK_STARTED, token: 'aaa' },
          { queueName: queueNameService.NAMES.PUPIL_PREFS, token: 'aab' },
          { queueName: queueNameService.NAMES.PUPIL_FEEDBACK, token: 'aab' },
          { queueName: queueNameService.NAMES.CHECK_SUBMIT, token: 'aab' }
        ])
      })

      test('throws an error if the check form allocation IDs are not supplied', async () => {
        try {
          await checkStartService.createPupilCheckPayloads()
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toBe('checks is not defined')
        }
      })

      test('throws an error if the check form allocation ID param is not an array', async () => {
        try {
          await checkStartService.createPupilCheckPayloads({})
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toBe('checks must be an array')
        }
      })

      test('prepares the question data', async () => {
        const res = await checkStartService.createPupilCheckPayloads([mockCheckFormAllocationLive], 1)
        expect(checkFormService.prepareQuestionData).toHaveBeenCalled()
        expect(Object.keys(res[0].questions[0])).toContain('order')
        expect(Object.keys(res[0].questions[0])).toContain('factor1')
        expect(Object.keys(res[0].questions[0])).toContain('factor2')
      })
    })
  })
})
