'use strict'

/**
 * Supertest will run a copy of the app on an ephemeral port and then tear it down.
 *
 */
const request = require('supertest')
const app = require('../app')
const sql = require('../services/data-access/sql.service')
const redisCacheService = require('../services/data-access/redis-cache.service')

/**
 * Sleep in ms
 * @param ms - milliseconds
 * @return {Promise}
 */
function sleep (ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

describe('nocache', () => {
  afterAll(async () => {
    await sql.drainPool()
    await redisCacheService.disconnect()
  })

  test('sets all nocache headers to ensure all pages are fresh', async () => {
    await sleep(1000) // wait for stable
    const res = await request(app)
      .get('/ping')
      .set('Accept', 'application/json')
    expect(res.get('Content-Type')).toMatch(/json/)
    expect(res.statusCode).toBe(200)
    expect(res.get('Cache-Control')).toEqual('no-store, no-cache, must-revalidate, proxy-revalidate')
    expect(res.get('Pragma')).toEqual('no-cache')
    expect(res.get('Expires')).toEqual('0')
    expect(res.get('Surrogate-Control')).toEqual('no-store')
    await sleep(30)
  })
})
