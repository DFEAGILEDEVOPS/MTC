import { RedisService, IRedisDataService } from './redis-service'

const RedisDataServiceMock = jest.fn<IRedisDataService, any>(() => ({
  get: jest.fn(),
  pipeline: jest.fn(),
  setex: jest.fn()
}))

let sut: RedisService
let redisDataServiceMock: IRedisDataService

describe.skip('RedisService', () => {

  beforeEach(() => {
    redisDataServiceMock = new RedisDataServiceMock()
    sut = new RedisService()
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  test.skip('setex: stores a string with expected metadata', async () => {
    const cachedValue = 'the string'
    const dataKey = 'the-data-key'
    const ttl = 123
    await sut.setex(dataKey, cachedValue, ttl)
    const expectedObjectToStore = {
      _meta: {
        type: 'string',
        ttl: ttl
      },
      value: cachedValue
    }
    expect(redisDataServiceMock.setex)
    .toHaveBeenCalledWith(dataKey, ttl, expectedObjectToStore)
  })

  test.skip('setex: stores a number with expected metadata', async () => {
    const cachedValue = 0
    const dataKey = 'the-data-key'
    const ttl = 123
    await sut.setex(dataKey, cachedValue, ttl)
    const expectedObjectToStore = {
      _meta: {
        type: 'number',
        ttl: ttl
      },
      value: cachedValue
    }
    expect(redisDataServiceMock.setex)
    .toHaveBeenCalledWith(dataKey, ttl, expectedObjectToStore)
  })

  test.skip('setex: stores an object with expected metadata', async () => {
    const cachedValue = {
      foo: 'bar',
      bar: {
        baz: 123
      }
    }
    const dataKey = 'the-data-key'
    const ttl = 123
    await sut.setex(dataKey, cachedValue, ttl)
    const expectedObjectToStore = {
      _meta: {
        type: 'object',
        ttl: ttl
      },
      value: JSON.stringify(cachedValue)
    }

    expect(redisDataServiceMock.setex)
    .toHaveBeenCalledWith(dataKey, ttl, expectedObjectToStore)
  })

  test.todo('unsupported data type scenario')

  test('get: string is retrieved exactly as set', async () => {
    const cachedValue = 'the string'
    const cacheKey = 'cacheKey'
    const ttl = 123
    await sut.setex(cacheKey, cachedValue, ttl)
    const retrievedValue = await sut.get(cacheKey)
    expect(retrievedValue).toBe(cachedValue)
  })
})
