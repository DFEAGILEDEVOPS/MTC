import { RedisService } from '../caching/redis-service'
import Redis, { RedisOptions } from 'ioredis'
import config from '../config'

let sut: RedisService
let ioRedis: Redis.Redis
const redisItemKey = 'INTEGRATION_TEST'

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

  beforeEach(async () => {
    sut = new RedisService()
    await sut.drop([redisItemKey])
  })

  afterAll(async () => {
    const response = await ioRedis.quit()
    console.log(`redis quit response:${response}`)
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('setex: stores a string with expected metadata', async () => {
    const cachedValue = 'the string'
    const ttl = 12345
    await sut.setex(redisItemKey, cachedValue, ttl)
    const expectedObjectToStore = {
      meta: {
        type: 'string'
      },
      value: cachedValue
    }
    const actualStoredItemString = await ioRedis.get(redisItemKey)
    if (!actualStoredItemString) {
      throw new Error('no item found with specified key')
    }
    const storedItemAsObject = JSON.parse(actualStoredItemString)
    expect(storedItemAsObject).toEqual(expectedObjectToStore)
  })

  test('setex: stores a number with expected metadata', async () => {
    const cachedValue = 0
    const ttl = 12345
    await sut.setex(redisItemKey, cachedValue, ttl)
    const expectedObjectToStore = {
      meta: {
        type: 'number'
      },
      value: cachedValue.toString()
    }
    const actualStoredItemString = await ioRedis.get(redisItemKey)
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
    const ttl = 12345
    await sut.setex(redisItemKey, cachedValue, ttl)
    const expectedObjectToStore = {
      meta: {
        type: 'object'
      },
      value: JSON.stringify(cachedValue)
    }
    const actualStoredItemString = await ioRedis.get(redisItemKey)
    if (!actualStoredItemString) {
      throw new Error('no item found with specified key')
    }
    const storedItemAsObject = JSON.parse(actualStoredItemString)
    expect(storedItemAsObject).toEqual(expectedObjectToStore)
  })

  test('get: string preservation intact on retrieval', async () => {
    const cachedValue = 'the string'
    const ttl = 12345
    await sut.setex(redisItemKey, cachedValue, ttl)
    const actual = await sut.get(redisItemKey)
    expect(actual).toBe(cachedValue)
  })

  test('get: number preservation intact on retrieval', async () => {
    const cachedValue = 123456
    const ttl = 12345
    await sut.setex(redisItemKey, cachedValue, ttl)
    const actual = await sut.get(redisItemKey)
    expect(actual).toBe(cachedValue)
  })

  test('get: object preservation intact on retrieval', async () => {
    const cachedValue = {
      foo: 'bar',
      bar: {
        baz: 123
      }
    }
    const ttl = 12345
    await sut.setex(redisItemKey, cachedValue, ttl)
    const actual = await sut.get(redisItemKey)
    expect(actual).toStrictEqual(cachedValue)
  })

  test('drop: removes all specified items from cache', async () => {
    const cacheKeys = [
      `${redisItemKey}_foo`,
      `${redisItemKey}_bar`,
      `${redisItemKey}_baz`,
      `${redisItemKey}_qux`
    ]
    for (let index = 0; index < cacheKeys.length; index++) {
      const key = cacheKeys[index]
      await sut.setex(key, { id: index }, 12345)
    }
    await sut.drop(cacheKeys)
    const foundKeys = await ioRedis.keys(`${redisItemKey}:*`)
    expect(foundKeys.length).toBe(0)
  })
})
