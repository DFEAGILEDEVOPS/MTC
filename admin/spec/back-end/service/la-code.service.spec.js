'use strict'
/* global describe, beforeEach, test, expect, spyOn */
const redisService = require('../../../services/data-access/redis-cache.service')
const logService = require('../../../services/log.service')
const laCodeDataService = require('../../../services/data-access/la-code.data.service')

describe('la code service', () => {
  const sut = require('../../../services/la-code.service')
  let logger

  beforeEach(() => {
    logger = logService.getLogger()
    spyOn(logger, 'info') // shush
  })

  test('it retrieves the la codes from redis first', async () => {
    spyOn(redisService, 'get').and.returnValue(Promise.resolve([201, 202, 203]))
    spyOn(laCodeDataService, 'sqlGetLaCodes').and.returnValue([])
    const codes = await sut.getLaCodes()
    expect(redisService.get).toHaveBeenCalled()
    expect(codes).toStrictEqual([201, 202, 203])
  })

  test('it retrieves codes from the database if they are not in redis', async () => {
    spyOn(redisService, 'get').and.returnValue(Promise.resolve(undefined))
    spyOn(laCodeDataService, 'sqlGetLaCodes').and.returnValue([201, 202, 203])
    spyOn(redisService, 'set')
    const codes = await sut.getLaCodes()
    expect(redisService.get).toHaveBeenCalled()
    expect(laCodeDataService.sqlGetLaCodes).toHaveBeenCalled()
    expect(codes).toStrictEqual([201, 202, 203])
  })

  test('it sets the codes in redis if it retrieves from the database', async () => {
    spyOn(redisService, 'get').and.returnValue(Promise.resolve(undefined))
    spyOn(laCodeDataService, 'sqlGetLaCodes').and.returnValue([201, 202, 203])
    spyOn(redisService, 'set')
    const codes = await sut.getLaCodes()
    expect(redisService.get).toHaveBeenCalled()
    expect(laCodeDataService.sqlGetLaCodes).toHaveBeenCalled()
    expect(redisService.set).toHaveBeenCalledWith('lacodes', codes, 1200000)
  })

  test('getLaCodeSetOfStrings returns a set of the la codes', async () => {
    spyOn(redisService, 'get').and.returnValue(Promise.resolve([1, 201, 202, 203]))
    const set = await sut.getLaCodeSetOfStrings()
    expect(set instanceof Set).toBe(true)
    expect(set.has('001')).toBe(true)
    expect(set.has('201')).toBe(true)
    expect(set.has('202')).toBe(true)
    expect(set.has('203')).toBe(true)
  })
})
