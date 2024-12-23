'use strict'

const sut = require('../../../services/prepare-check.service')
const pinService = require('../../../services/pin.service')
const redisService = require('../../../services/data-access/redis-cache.service')
const moment = require('moment')
const { PupilFrozenService } = require('../../../services/pupil-frozen/pupil-frozen.service')

let check

describe('prepare-check.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  beforeEach(() => {
    jest.spyOn(pinService, 'generatePinTimestamp').mockImplementation()
    jest.spyOn(PupilFrozenService, 'throwIfFrozenByIds').mockImplementation()
    check = {
      checkCode: 'check-code',
      schoolPin: 'school-pin',
      pupilPin: 'pupil-pin',
      pupil: {
        checkCode: 'checkCode',
        pinExpiresAt: moment().add(5, 'hours').toDate(),
        id: 123
      },
      school: {
        id: 456
      },
      config: {
        foo: 'bar'
      },
      questions: [
        {
          factor1: 5,
          factor2: 6
        }
      ],
      tokens: [
        {
          token: 'abc'
        }
      ]
    }
  })
  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('rejects an argument that is not an array', async () => {
    await expect(sut.prepareChecks('bad argument')).rejects.toThrow('checks is not an array')
  })

  test('throws an error if one or more pupils are frozen', async () => {
    jest.spyOn(PupilFrozenService, 'throwIfFrozenByIds').mockRejectedValue(new Error('frozen'))
    await expect(sut.prepareChecks([check])).rejects.toThrow('frozen')
  })

  test('should add each check with the expected cache key and a lookup item', async () => {
    let actualPreparedCheckKey, actualPreparedCheckLookupKey, actualPupilUuidLookupKey
    check.schoolPin = 'schoolPin'
    check.pupilPin = 'pupilPin'
    const expectedPreparedCheckLookupKey = `prepared-check-lookup:${check.checkCode}`
    const expectedPreparedCheckKey = `preparedCheck:${check.schoolPin}:${check.pupilPin}`
    const expectedPupilUuidLookupKey = `pupil-uuid-lookup:${check.checkCode}`
    jest.spyOn(redisService, 'setMany').mockImplementation((batch) => {
      actualPreparedCheckKey = batch[0].key
      actualPreparedCheckLookupKey = batch[1].key
      actualPupilUuidLookupKey = batch[2].key
    })
    await sut.prepareChecks([check])
    expect(actualPreparedCheckKey).toEqual(expectedPreparedCheckKey)
    expect(actualPreparedCheckLookupKey).toEqual(expectedPreparedCheckLookupKey)
    expect(actualPupilUuidLookupKey).toEqual(expectedPupilUuidLookupKey)
  })

  test('should cache each item with the expected structure', async () => {
    let cachedObject
    jest.spyOn(redisService, 'setMany').mockImplementation((batch) => {
      cachedObject = batch[0].value
    })
    await sut.prepareChecks([check])
    expect(cachedObject.checkCode).toEqual(check.pupil.checkCode)
    expect(cachedObject.config).toEqual(check.config)
    expect(cachedObject.createdAt).toBeDefined()
    expect(cachedObject.pinExpiresAtUtc).toBeDefined()
    expect(cachedObject.pupilId).toBe(check.pupil.id)
    expect(cachedObject.questions).toBe(check.questions)
    expect(cachedObject.school).toBe(check.school)
    expect(cachedObject.schoolId).toBe(check.school.id)
    expect(cachedObject.tokens).toBe(check.tokens)
    expect(cachedObject.updatedAt).toBeDefined()
  })

  test('should cache each item with the expected ttl', async () => {
    let actualPreparedCheckTtl, actualLookupKeyTtl
    const fullTestRunToleranceInSeconds = 60
    const fiveHoursInSeconds = 18000
    jest.spyOn(redisService, 'setMany').mockImplementation((items) => {
      actualPreparedCheckTtl = items[0].ttl
      actualLookupKeyTtl = items[1].ttl
    })
    await sut.prepareChecks([check])
    expect(actualPreparedCheckTtl).toBeGreaterThan(fiveHoursInSeconds - fullTestRunToleranceInSeconds)
    expect(actualPreparedCheckTtl).toBeLessThanOrEqual(fiveHoursInSeconds)
    expect(actualLookupKeyTtl).toEqual(actualPreparedCheckTtl)
  })
})
