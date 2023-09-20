'use strict'

/* global describe expect beforeEach jest test afterEach */
const checkFormService = require('../check-form.service')
const checkStartDataService = require('./data-access/check-start.data.service')
const checkStartService = require('./check-start.service')
const checkWindowMock = require('../../spec/back-end/mocks/check-window-2')
const configService = require('../config.service')
const logger = require('../log.service.js').getLogger()
const pinGenerationDataService = require('../data-access/pin-generation.data.service')
const prepareCheckService = require('../prepare-check.service')
const sasTokenService = require('../sas-token.service')
const redisCacheService = require('../data-access/redis-cache.service')
const queueNameService = require('../storage-queue-name-service')
const schoolPinService = require('./school-pin.service')
const pinService = require('../pin.service')
const config = require('../../config')
const { JwtService } = require('../jwt/jwt.service')
const jwtService = JwtService.getInstance()
const R = require('ramda')
const uuid = require('uuid')

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
  const userId = 5

  const mockPupils = [
    { id: 1 },
    { id: 2 },
    { id: 3 }
  ]
  const pupilIds = [1, 2, 3]
  const pupilIdsHackAttempt = [1, 2, 3, 4]
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
    jest.spyOn(sasTokenService, 'generateSasToken').mockImplementation(async (s) => {
      return {
        token: '<someToken>',
        url: `http://localhost/${s}`,
        queueName: 'abc'
      }
    })
    jest.spyOn(logger, 'debug').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('#prepareCheck2', () => {
    beforeEach(() => {
      jest.spyOn(checkStartDataService, 'sqlFindPupilsEligibleForPinGenerationById').mockResolvedValue(mockPupils)
      jest.spyOn(checkStartDataService, 'sqlFindAllFormsAssignedToCheckWindow').mockResolvedValue([])
      jest.spyOn(checkStartDataService, 'sqlFindAllFormsUsedByPupils').mockResolvedValue([])
      jest.spyOn(pinGenerationDataService, 'sqlCreateBatch').mockResolvedValue(mockNewChecks)
      jest.spyOn(checkStartService, 'initialisePupilCheck').mockResolvedValue(mockPreparedCheck)
      jest.spyOn(checkStartService, 'createPupilCheckPayloads').mockResolvedValue(mockCreatePupilCheckPayloads)
      jest.spyOn(prepareCheckService, 'prepareChecks').mockImplementation() // don't put checks in redis
      jest.spyOn(configService, 'getBatchConfig').mockResolvedValue(
        {
          1: configService.getBaseConfig(),
          2: configService.getBaseConfig(),
          3: configService.getBaseConfig()
        })
      jest.spyOn(checkStartDataService, 'sqlStoreBatchConfigs').mockImplementation()
      jest.spyOn(redisCacheService, 'get').mockImplementation()
      jest.spyOn(redisCacheService, 'set').mockImplementation()
    })

    test('throws an error if the pupilIds are not provided', async () => {
      await expect(checkStartService.prepareCheck2(undefined, dfeNumber, schoolId, userId, true, checkWindowMock))
        .rejects
        .toThrow('pupilIds is required')
    })

    test('throws an error if the schoolId is not provided', async () => {
      await expect(checkStartService.prepareCheck2(pupilIds, dfeNumber, undefined, userId, true, checkWindowMock))
        .rejects
        .toThrow('schoolId is required')
    })

    test('throws an error if the userId is not provided', async () => {
      await expect(checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, undefined, true, checkWindowMock))
        .rejects
        .toThrow('userId is required')
    })

    test('throws an error if provided with pupilIds that are not a part of the school', async () => {
      jest.spyOn(logger, 'error').mockImplementation()
      await expect(checkStartService.prepareCheck2(pupilIdsHackAttempt, dfeNumber, schoolId, userId, true, checkWindowMock))
        .rejects
        .toThrow('Validation failed')
    })

    test('calls sqlFindPupilsEligibleForPinGenerationById to find pupils', async () => {
      await checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, userId, true, checkWindowMock)
      expect(checkStartDataService.sqlFindPupilsEligibleForPinGenerationById).toHaveBeenCalledTimes(1)
    })

    test('calls initialisePupilCheck to randomly select a check form', async () => {
      await checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, userId, true, checkWindowMock)
      expect(checkStartService.initialisePupilCheck).toHaveBeenCalledTimes(mockPupils.length)
      expect(pinGenerationDataService.sqlCreateBatch).toHaveBeenCalledTimes(1)
    })

    test('adds config to the database', async () => {
      await checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, userId, true, checkWindowMock)
      // pupil status re-calc and prepare-check queues
      expect(checkStartDataService.sqlStoreBatchConfigs).toHaveBeenCalledTimes(1)
    })
  })

  describe('prepareCheck2:school password generation', () => {
    beforeEach(() => {
      jest.spyOn(checkStartDataService, 'sqlFindPupilsEligibleForPinGenerationById').mockResolvedValue(mockPupils)
      jest.spyOn(checkStartDataService, 'sqlFindAllFormsAssignedToCheckWindow').mockResolvedValue([])
      jest.spyOn(checkStartDataService, 'sqlFindAllFormsUsedByPupils').mockResolvedValue([])
      jest.spyOn(checkStartService, 'initialisePupilCheck').mockResolvedValue(mockPreparedCheck)
      // @ts-ignore
      jest.spyOn(checkStartService, 'createPupilCheckPayloads').mockResolvedValue(mockCreatePupilCheckPayloads)
      jest.spyOn(prepareCheckService, 'prepareChecks').mockImplementation() // don't put checks in redis
      jest.spyOn(configService, 'getBatchConfig').mockResolvedValue(
        {
          1: configService.getBaseConfig(),
          2: configService.getBaseConfig(),
          3: configService.getBaseConfig()
        })
      jest.spyOn(checkStartDataService, 'sqlStoreBatchConfigs').mockImplementation()
      jest.spyOn(redisCacheService, 'get').mockImplementation()
      jest.spyOn(redisCacheService, 'set').mockImplementation()
    })

    test('attempts to generate school pin if error 50001 thrown and setting enabled', async () => {
      jest.spyOn(schoolPinService, 'generateSchoolPin').mockImplementation()
      jest.spyOn(logger, 'warn').mockImplementation()
      config.FeatureToggles.schoolPinGenFallbackEnabled = true
      jest.spyOn(pinGenerationDataService, 'sqlCreateBatch').mockImplementation(() => {
        throw new Error('50001: no school pin found')
      })
      await expect(checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, userId, true, checkWindowMock))
        .rejects
        .toThrow()
      expect(schoolPinService.generateSchoolPin).toHaveBeenCalledTimes(1)
      expect(pinGenerationDataService.sqlCreateBatch).toHaveBeenCalledTimes(2)
    })

    test('does not attempt to generate school pin if error 50001 thrown and setting disabled', async () => {
      jest.spyOn(schoolPinService, 'generateSchoolPin').mockImplementation()
      config.FeatureToggles.schoolPinGenFallbackEnabled = false
      jest.spyOn(pinGenerationDataService, 'sqlCreateBatch').mockImplementation(() => {
        throw new Error('50001: no school pin found')
      })
      await expect(checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, userId, true, checkWindowMock))
        .rejects
        .toThrow()
      expect(schoolPinService.generateSchoolPin).not.toHaveBeenCalled()
      expect(pinGenerationDataService.sqlCreateBatch).toHaveBeenCalledTimes(1)
    })

    test('does not attempt to generate school pin if error.number is not 50001', async () => {
      jest.spyOn(schoolPinService, 'generateSchoolPin').mockImplementation()
      config.FeatureToggles.schoolPinGenFallbackEnabled = true
      jest.spyOn(pinGenerationDataService, 'sqlCreateBatch').mockImplementation(() => {
        const err = new Error()
        // @ts-ignore
        err.number = 49999
        throw err
      })
      await expect(checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, userId, true, checkWindowMock))
        .rejects
        .toThrow()
      expect(schoolPinService.generateSchoolPin).toHaveBeenCalledTimes(0)
      expect(pinGenerationDataService.sqlCreateBatch).toHaveBeenCalledTimes(1)
    })

    test('does not attempt to generate school pin if sqlCreateBatch does not error', async () => {
      jest.spyOn(schoolPinService, 'generateSchoolPin').mockImplementation()
      const checksWithNoSchoolPins = [
        { id: 1, check_checkCode: '1A', pupil_id: 1, school_pin: 'aaa11aaa' },
        { id: 1, check_checkCode: '2A', pupil_id: 2, school_pin: 'aaa11aaa' },
        { id: 3, check_checkCode: '3A', pupil_id: 3, school_pin: 'aaa11aaa' }
      ]
      jest.spyOn(pinGenerationDataService, 'sqlCreateBatch').mockResolvedValue(checksWithNoSchoolPins)
      await checkStartService.prepareCheck2(pupilIds, dfeNumber, schoolId, userId, true, checkWindowMock)
      expect(schoolPinService.generateSchoolPin).not.toHaveBeenCalled()
    })
  })

  describe('#initialisePupilCheck', () => {
    beforeEach(() => {
      jest.spyOn(pinService, 'generatePinTimestamp').mockImplementation()
    })
    test('calls generatePinTimestamp to generate pinExpiresAt for a pupil', async () => {
      jest.spyOn(checkFormService, 'allocateCheckForm').mockResolvedValue(checkFormMock)
      await service.initialisePupilCheck(1, checkWindowMock, [], [], true, userId, schoolId)
      expect(pinService.generatePinTimestamp).toHaveBeenCalledTimes(1)
    })
    test('calls allocateCheckForm for a pupil', async () => {
      jest.spyOn(checkFormService, 'allocateCheckForm').mockResolvedValue(checkFormMock)
      await service.initialisePupilCheck(1, checkWindowMock, [], [], true, userId, schoolId)
      expect(checkFormService.allocateCheckForm).toHaveBeenCalledTimes(1)
    })

    test('throws an error if a checkform is not returned', async () => {
      jest.spyOn(checkFormService, 'allocateCheckForm').mockImplementation()
      await expect(service.initialisePupilCheck(1, checkWindowMock, [], [], true, userId, schoolId))
        .rejects
        .toThrow('CheckForm not allocated')
    })

    describe('for live pins', () => {
      test('returns a check object, ready to be inserted into the db', async () => {
        jest.spyOn(checkFormService, 'allocateCheckForm').mockResolvedValue(checkFormMock)
        const c = await service.initialisePupilCheck(1, checkWindowMock, undefined, undefined, true, userId, schoolId)
        expect({}.hasOwnProperty.call(c, 'pupil_id'))
        expect({}.hasOwnProperty.call(c, 'checkWindow_id'))
        expect({}.hasOwnProperty.call(c, 'checkForm_id'))
        expect({}.hasOwnProperty.call(c, 'createdBy_userId'))
      })
    })

    describe('for test pins', () => {
      test('returns a check object, ready to be inserted into the db', async () => {
        jest.spyOn(checkFormService, 'allocateCheckForm').mockResolvedValue(checkFormMock)
        const c = await service.initialisePupilCheck(1, checkWindowMock, undefined, undefined, false, userId, schoolId)
        expect({}.hasOwnProperty.call(c, 'pupil_id'))
        expect({}.hasOwnProperty.call(c, 'checkWindow_id'))
        expect({}.hasOwnProperty.call(c, 'checkForm_id'))
        expect({}.hasOwnProperty.call(c, 'createdBy_userId'))
      })
    })
  })

  describe('#createPupilCheckPayloads', () => {
    const mockCheckFormAllocationLive = require('../../spec/back-end/mocks/check-form-allocation')
    beforeEach(() => {
      jest.spyOn(configService, 'getBatchConfig').mockResolvedValue({ 1: configService.getBaseConfig() })
      jest.spyOn(checkFormService, 'prepareQuestionData')
    })

    describe('when live checks are generated', () => {
      beforeEach(() => {
        jest.spyOn(sasTokenService, 'getTokens').mockResolvedValue([
          { queueName: queueNameService.NAMES.CHECK_STARTED, token: 'aaa' },
          { queueName: queueNameService.NAMES.PUPIL_PREFS, token: 'aab' },
          { queueName: queueNameService.NAMES.PUPIL_FEEDBACK, token: 'aab' },
          { queueName: queueNameService.NAMES.CHECK_SUBMIT, token: 'aab' }
        ])
        const mockSignMethod = async (payload) => {
          return payload.checkCode
        }
        jest.spyOn(jwtService, 'sign').mockImplementation(mockSignMethod)
      })

      test('throws an error if the check form allocation IDs are not supplied', async () => {
        await expect(checkStartService.createPupilCheckPayloads(undefined, undefined))
          .rejects
          .toThrow('checks is not defined')
      })

      test('throws an error if the check form allocation ID param is not an array', async () => {
        // @ts-ignore - delibrate type mismatch
        await expect(checkStartService.createPupilCheckPayloads({}, undefined))
          .rejects
          .toThrow('checks must be an array')
      })

      test('prepares the question data', async () => {
        const res = await checkStartService.createPupilCheckPayloads([mockCheckFormAllocationLive], 1)
        expect(checkFormService.prepareQuestionData).toHaveBeenCalled()
        expect(Object.keys(res[0].questions[0])).toContain('order')
        expect(Object.keys(res[0].questions[0])).toContain('factor1')
        expect(Object.keys(res[0].questions[0])).toContain('factor2')
      })

      test('generates a new jwt token for each pupil', async () => {
        const checks = [
          mockCheckFormAllocationLive,
          mockCheckFormAllocationLive,
          mockCheckFormAllocationLive
        ]
        const res = await checkStartService.createPupilCheckPayloads(checks, 1)
        expect(res).toHaveLength(checks.length)
        expect(res[0].tokens.jwt).toBeDefined()
        expect(jwtService.sign).toHaveBeenCalledTimes(checks.length)
      })

      test('payload should contain check code', async () => {
        const checkCode1 = uuid.v4()
        const checkformAllocation1 = R.clone(mockCheckFormAllocationLive)
        checkformAllocation1.check_checkCode = checkCode1
        const checks = [
          checkformAllocation1
        ]
        await checkStartService.createPupilCheckPayloads(checks, 1)
        expect(jwtService.sign).toHaveBeenCalledWith({ checkCode: checkCode1 },
          {
            issuer: 'MTC Admin',
            subject: checkformAllocation1.pupil_id.toString(),
            expiresIn: '5d'
          })
      })

      test('jwt token should expire in 5 days', async () => {
        const fiveDays = '5d'
        await checkStartService.createPupilCheckPayloads([mockCheckFormAllocationLive], 1)
        expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Object),
          {
            issuer: expect.any(String),
            subject: expect.any(String),
            expiresIn: fiveDays
          })
      })

      test('jwt token should have correct issuer', async () => {
        const correctIssuer = 'MTC Admin'
        await checkStartService.createPupilCheckPayloads([mockCheckFormAllocationLive], 1)
        expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Object),
          {
            issuer: correctIssuer,
            subject: expect.any(String),
            expiresIn: expect.any(String)
          })
      })
    })
  })
})
