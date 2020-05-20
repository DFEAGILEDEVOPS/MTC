'use strict'
/* global describe it expect fail */

const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '..', '.env')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    // console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.warn('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}

const sut = require('../services/data-access/sql.pool.service')
const roles = require('../lib/consts/roles')

describe('sql.pool.service:integration', () => {
  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('createPool', () => {
    it('returns a pool when valid role specified', async () => {
      const actual = sut.createPool(roles.teacher)
      await actual.connect()
      expect(actual).toBeDefined()
      expect(actual.connected).toBe(true)
    })
    it('returns the existing pool if 2nd creation is attempted', async () => {
      const pool1 = sut.createPool(roles.teacher)
      const pool2 = sut.createPool(roles.teacher)
      expect(pool2).toBe(pool1)
      sut.closePool(roles.teacher)
    })
    it('allows builder error to bubble up if role not supported', () => {
      try {
        sut.createPool('void role')
        fail('error should have been thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toEqual('role not supported')
      }
    })
  })

  describe('closePool', () => {
    it('does nothing if pool does not exist', () => {
      const actual = sut.closePool('no pool')
      expect(actual).toBeUndefined()
    })
    it('returns closed pool and removes if exists', async () => {
      const actual = await sut.createPool(roles.teacher)
      await actual.connect()
      expect(actual).toBeDefined()
      expect(actual.connected).toBe(true)
      const closed = await sut.closePool(roles.teacher)
      expect(closed.connected).toBe(false)
      expect(sut.getPool(roles.teacher)).toBeUndefined()
    })
  })

  describe('getPool', () => {
    it('returns nothing if pool does not exist', () => {
      const actual = sut.getPool('void pool')
      expect(actual).toBeUndefined()
    })
    it('returns pool if exists', async () => {
      const pool = sut.createPool(roles.teacher)
      expect(pool).toBeDefined()
      const actual = sut.getPool(roles.teacher)
      expect(actual).toBe(pool)
    })
  })
})
