'use strict'
/* global describe beforeEach beforeAll afterEach it xit expect jasmine spyOn fail */

require('dotenv').config()
const sql = require('../services/data-access/sql.service')
const sqlPool = require('../services/data-access/sql.pool.service')
const TYPES = require('tedious').TYPES

describe('sql.service:integration', () => {
  beforeAll(() => {
    sqlPool.init()
  })

  it('should permit select query with no parameters', async () => {
    let settingsRows = await sql.query('SELECT * FROM Settings')
    expect(settingsRows).toBeDefined()
    expect(settingsRows.length).toBe(1)
  })

  it('should permit select query with parameters', async () => {
    let settingsRows
    const id = { name: 'id', type: TYPES.Int, value: 1 }
    settingsRows = await sql.query('SELECT * FROM Settings WHERE id=@id', [id])
    expect(settingsRows).toBeDefined()
    expect(settingsRows.length).toBe(1)
  })

  it('should not permit delete operation to mtc application user', async () => {
    try {
      await sql.query('DELETE FROM Settings')
      fail('DELETE operation should not have succeeded')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toContain('The DELETE permission was denied')
    }
  })

  it('should not permit TRUNCATE TABLE operation to mtc application user', async () => {
    try {
      await sql.query('TRUNCATE TABLE Settings')
      fail('TRUNCATE operation should not have succeeded')
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

  xit('should transform the results arrays into a JSON array', async () => {
    await sql.query('SELECT * FROM Settings')
  })
})
