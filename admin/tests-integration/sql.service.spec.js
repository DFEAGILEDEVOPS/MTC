'use strict'
/* global describe beforeEach beforeAll afterEach it expect jasmine spyOn fail */

require('dotenv').config()
const sql = require('../services/data-access/sql.service')
const sqlPool = require('../services/data-access/sql.pool.service')

describe('sql.service:integration', () => {
  beforeAll(async (done) => {
    sqlPool.init()
    done()
  })

  it('should permit select query with no parameters', async (done) => {
    let settingsRows
    try {
      settingsRows = await sql.query('SELECT * FROM Settings')
      console.dir(settingsRows)
    } catch (error) {
      fail(error)
    }
    done()
  })

  it('should not permit delete operation to mtc application user', async (done) => {
    try {
      await sql.query('DELETE FROM Settings')
      fail('delete operation should not have succeeded')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message.startsWith('The DELETE permission was denied')).toBe(true)
      done()
    }
  })
})
