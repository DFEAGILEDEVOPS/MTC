import { RedisService } from '../caching/redis-service'
import Redis, { RedisOptions } from 'ioredis'
import config from '../config'

let sut: RedisService
let ioRedis: Redis.Redis
const redisKeyPrefix = 'INTEGRATION_TEST_'

const buildRedisKey = (postfix: string): string => {
  return `${redisKeyPrefix}${postfix}`
}

describe('RedisService', () => {

  beforeAll(() => {
    const options: RedisOptions = {
      port: Number(config.Redis.Port),
      host: config.Redis.Host,
      password: config.Redis.Key
    }
    if (config.Redis.useTLS) {
      options.tls = {
        host: config.Redis.Host
      }
    }
    ioRedis = new Redis(options)
  })

  beforeEach(() => {
    sut = new RedisService()
    // TODO drop everything prefixed with INTEGRATION_TEST_
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('setex: stores a string with expected metadata', async () => {
    const cachedValue = 'the string'
    const dataKey = buildRedisKey('the-data-key')
    const ttl = 123
    await sut.setex(dataKey, cachedValue, ttl)
    const expectedObjectToStore = {
      _meta: {
        type: 'string',
        ttl: ttl
      },
      value: cachedValue
    }
    const actualStoredItemString = await ioRedis.get(dataKey)
    if (!actualStoredItemString) {
      throw new Error('no item found with specified key')
    }
    const storedItemAsObject = JSON.parse(actualStoredItemString)
    expect(storedItemAsObject).toEqual(expectedObjectToStore)
  })

  test('setex: stores a number with expected metadata', async () => {
    const cachedValue = 0
    const dataKey = 'the-data-key'
    const ttl = 123
    await sut.setex(dataKey, cachedValue, ttl)
    const expectedObjectToStore = {
      _meta: {
        type: 'number',
        ttl: ttl
      },
      value: cachedValue.toString()
    }
    const actualStoredItemString = await ioRedis.get(dataKey)
    if (!actualStoredItemString) {
      throw new Error('no item found with specified key')
    }
    const storedItemAsObject = JSON.parse(actualStoredItemString)
    expect(storedItemAsObject).toEqual(expectedObjectToStore)
  })

  test('setex: stores an object with expected metadata', async () => {
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
    const actualStoredItemString = await ioRedis.get(dataKey)
    if (!actualStoredItemString) {
      throw new Error('no item found with specified key')
    }
    const storedItemAsObject = JSON.parse(actualStoredItemString)
    expect(storedItemAsObject).toEqual(expectedObjectToStore)
  })

  test.todo('unsupported data type scenario')
})
