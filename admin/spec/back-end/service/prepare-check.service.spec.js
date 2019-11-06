'use strict'

/* global describe it expect beforeEach spyOn fail */
const sut = require('../../../services/prepare-check.service')
const redisService = require('../../../services/redis-cache.service')
const moment = require('moment')

let check

describe('prepare-check.service', () => {
  beforeEach(() => {
    check = {
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

  it('should add each check with the expected cache key', async () => {
    let actualKey
    check.schoolPin = 'schoolPin'
    check.pupilPin = 'pupilPin'
    spyOn(redisService, 'setMany').and.callFake((batch, ttl) => {
      actualKey = batch[0].key
    })
    await sut.prepareChecks([check])
    expect(actualKey).toEqual(`preparedCheck:${check.schoolPin}:${check.pupilPin}`)
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
    expect(cachedObject.pinExpiresAt).toBeDefined()
    expect(cachedObject.pupilId).toBe(check.pupil.id)
    expect(cachedObject.questions).toBe(check.questions)
    expect(cachedObject.school).toBe(check.school)
    expect(cachedObject.schoolId).toBe(check.school.id)
    expect(cachedObject.tokens).toBe(check.tokens)
    expect(cachedObject.updatedAt).toBeDefined()
    expect(cachedObject.pinValidFrom).toBeDefined()
  })

  it('should cache each item with the expected ttl', async () => {
    let ttl
    const fullTestRunToleranceInSeconds = 60
    const fiveHoursInSeconds = 18000
    spyOn(redisService, 'setMany').and.callFake((items) => {
      ttl = items[0].ttl
    })
    await sut.prepareChecks([check])
    expect(ttl).toBeGreaterThan(fiveHoursInSeconds - fullTestRunToleranceInSeconds)
    expect(ttl).toBeLessThanOrEqual(fiveHoursInSeconds)
  })
})
