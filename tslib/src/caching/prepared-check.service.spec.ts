import { IRedisService } from './redis-service'
import { RedisServiceMock } from './redis-service.mock'
import { faker } from '@faker-js/faker'
import redisKeyService from './redis-key.service'
import { PreparedCheckService } from './prepared-check.service'

let sut: PreparedCheckService
let redisServiceMock: IRedisService
const checkCode = faker.datatype.uuid()

describe('prepared-check.service', () => {
  beforeEach(() => {
    redisServiceMock = new RedisServiceMock()
    sut = new PreparedCheckService(redisServiceMock)
  })

  test('sut should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('should obtain prepared check lookup key first', async () => {
    const lookupKey = redisKeyService.getPreparedCheckLookupKey(checkCode)
    const preparedCheckKey = `prepared-check-key-${faker.datatype.uuid()}`
    jest.spyOn(redisServiceMock, 'get').mockReturnValueOnce(Promise.resolve(preparedCheckKey))
    await sut.fetch(checkCode)
    expect(redisServiceMock.get).toHaveBeenNthCalledWith(1, lookupKey)
    expect(redisServiceMock.get).toHaveBeenLastCalledWith(preparedCheckKey)
  })

  test('when prepared check key is empty string, returns undefined', async () => {
    jest.spyOn(redisServiceMock, 'get').mockReturnValueOnce(Promise.resolve(''))
    const result = await sut.fetch(checkCode)
    expect(result).toBeUndefined()
    expect(redisServiceMock.get).toHaveBeenCalledTimes(1)
  })

  test('when prepared check key is undefined, returns undefined', async () => {
    jest.spyOn(redisServiceMock, 'get').mockReturnValueOnce(Promise.resolve(undefined))
    const result = await sut.fetch(checkCode)
    expect(result).toBeUndefined()
    expect(redisServiceMock.get).toHaveBeenCalledTimes(1)
  })
})
