'use strict'

const redisService = require('../../../services/data-access/redis-cache.service')
const logService = require('../../../services/log.service')
const laCodeDataService = require('../../../services/data-access/la-code.data.service')

describe('la code service', () => {
  const sut = require('../../../services/la-code.service')
  let logger

  beforeEach(() => {
    logger = logService.getLogger()
    jest.spyOn(logger, 'info').mockImplementation() // shush
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('it retrieves the la codes from redis first', async () => {
    jest.spyOn(redisService, 'get').mockResolvedValue([201, 202, 203])
    jest.spyOn(laCodeDataService, 'sqlGetLaCodes').mockReturnValue([])
    const codes = await sut.getLaCodes()
    expect(redisService.get).toHaveBeenCalled()
    expect(codes).toStrictEqual([201, 202, 203])
  })

  test('it retrieves codes from the database if they are not in redis', async () => {
    jest.spyOn(redisService, 'get').mockImplementation()
    jest.spyOn(laCodeDataService, 'sqlGetLaCodes').mockResolvedValue([201, 202, 203])
    jest.spyOn(redisService, 'set').mockImplementation()
    const codes = await sut.getLaCodes()
    expect(redisService.get).toHaveBeenCalled()
    expect(laCodeDataService.sqlGetLaCodes).toHaveBeenCalled()
    expect(codes).toStrictEqual([201, 202, 203])
  })

  test('it sets the codes in redis if it retrieves from the database', async () => {
    jest.spyOn(redisService, 'get').mockImplementation()
    jest.spyOn(laCodeDataService, 'sqlGetLaCodes').mockResolvedValue([201, 202, 203])
    jest.spyOn(redisService, 'set').mockImplementation()
    const codes = await sut.getLaCodes()
    expect(redisService.get).toHaveBeenCalled()
    expect(laCodeDataService.sqlGetLaCodes).toHaveBeenCalled()
    expect(redisService.set).toHaveBeenCalledWith('lacodes', codes, 1200000)
  })

  test('getLaCodeSetOfStrings returns a set of the la codes', async () => {
    jest.spyOn(redisService, 'get').mockResolvedValue([1, 201, 202, 203])
    const set = await sut.getLaCodeSetOfStrings()
    expect(set instanceof Set).toBe(true)
    expect(set.has('001')).toBe(true)
    expect(set.has('201')).toBe(true)
    expect(set.has('202')).toBe(true)
    expect(set.has('203')).toBe(true)
  })
})
