'use strict'

const moment = require('moment')
const redisCache = require('../services/data-access/redis-cache.service')

describe('redisCache integration tests', () => {
  afterAll(async () => { await redisCache.disconnect() })

  test('can serialise and deserialse an object with different types', async () => {
    const o = {
      name: 'A String',
      score: 25,
      height: 1.92,
      dateOfBirth: moment.utc('2010-07-31T00:00:00')
    }
    const key = 'integrationTest001'
    await redisCache.set(key, o)
    const o2 = await redisCache.get(key)
    expect(o).toMatchObject({
      name: 'A String',
      score: 25,
      height: 1.92
    })
    expect(o.dateOfBirth.valueOf()).toEqual(o2.dateOfBirth.valueOf())
    await redisCache.drop(key)
  })

  test.each(['2019-10', '1001', '2019-10-01', '2019-01-01T', '2019-10-01T00:00'])(
    'does not turn into a datetime: %s', async s => {
      const key = 'integrationTest002'
      await redisCache.set(key, s)
      const deserialsed = await redisCache.get(key)
      expect(typeof deserialsed).toEqual('string') // if it got converted to Moment it would be object
      await redisCache.drop(key)
    })
})
