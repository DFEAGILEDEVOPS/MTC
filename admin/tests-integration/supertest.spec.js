'use strict'
/* global describe it expect */

/**
 * Supertest will run a copy of the app on an ephemeral port and then tear it down.
 *
 */
const request = require('supertest')
const app = require('../app')

describe('nocache', () => {
  it('sets all nocache headers to ensure all pages are fresh', async () => {
    const res = await request(app)
      .get('/ping')
      .set('Accept', 'application/json')
    expect(res.get('Content-Type')).toMatch(/json/)
    expect(res.statusCode).toBe(200)
    expect(res.get('Cache-Control')).toEqual('no-store, no-cache, must-revalidate, proxy-revalidate')
    expect(res.get('Pragma')).toEqual('no-cache')
    expect(res.get('Expires')).toEqual('0')
    expect(res.get('Surrogate-Control')).toEqual('no-store')
  })
})
