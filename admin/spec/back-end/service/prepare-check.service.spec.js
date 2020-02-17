'use strict'

/* global describe it expect beforeEach spyOn fail */
const sut = require('../../../services/prepare-check.service')
const pinValidityGeneratorService = require('../../../services/pin-validity-generator.service')
const redisService = require('../../../services/data-access/redis-cache.service')
const moment = require('moment')

let check

describe('prepare-check.service', () => {
  beforeEach(() => {
    spyOn(pinValidityGeneratorService, 'generatePinTimestamp')
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
  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  it('rejects an argument that is not an array', async () => {
    try {
      await sut.prepareChecks('bad argument')
      fail('error should have been thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toEqual('checks is not an array')
    }
  })

  it('should add each check with the expected cache key and a lookup item', async () => {
    let actualPreparedCheckKey, actualPreparedCheckLookupKey, actualPupilUuidLookupKey
    check.schoolPin = 'schoolPin'
    check.pupilPin = 'pupilPin'
    const expectedPreparedCheckLookupKey = `prepared-check-lookup:${check.checkCode}`
    const expectedPreparedCheckKey = `preparedCheck:${check.schoolPin}:${check.pupilPin}`
    const expectedPupilUuidLookupKey = `pupil-uuid-lookup:${check.checkCode}`
    spyOn(redisService, 'setMany').and.callFake((batch, ttl) => {
      actualPreparedCheckKey = batch[0].key
      actualPreparedCheckLookupKey = batch[1].key
      actualPupilUuidLookupKey = batch[2].key
    })
    await sut.prepareChecks([check])
    expect(actualPreparedCheckKey).toEqual(expectedPreparedCheckKey)
    expect(actualPreparedCheckLookupKey).toEqual(expectedPreparedCheckLookupKey)
    expect(actualPupilUuidLookupKey).toEqual(expectedPupilUuidLookupKey)
  })

  it('should cache each item with the expected structure', async () => {
    let cachedObject
    spyOn(redisService, 'setMany').and.callFake((batch, ttl) => {
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

  it('should cache each item with the expected ttl', async () => {
    let actualPreparedCheckTtl, actualLookupKeyTtl
    const fullTestRunToleranceInSeconds = 60
    const fiveHoursInSeconds = 18000
    spyOn(redisService, 'setMany').and.callFake((items) => {
      actualPreparedCheckTtl = items[0].ttl
      actualLookupKeyTtl = items[1].ttl
    })
    await sut.prepareChecks([check])
    expect(actualPreparedCheckTtl).toBeGreaterThan(fiveHoursInSeconds - fullTestRunToleranceInSeconds)
    expect(actualPreparedCheckTtl).toBeLessThanOrEqual(fiveHoursInSeconds)
    expect(actualLookupKeyTtl).toEqual(actualPreparedCheckTtl)
  })
})
