'use strict'
/* global describe beforeEach beforeAll afterEach it fit xit expect jasmine spyOn fail */

require('dotenv').config()
const sql = require('../services/data-access/sql.service')
const sqlPool = require('../services/data-access/sql.pool.service')
const TYPES = require('tedious').TYPES
const moment = require('moment')

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

  it('should transform the results arrays into a JSON array', async () => {
    await sql.query('SELECT * FROM Settings')
    const actual = await sql.query('SELECT * FROM Settings')
    expect(actual).toBeDefined()
    expect(actual.length).toBe(1)
    const row = actual[0]
    expect(row.id).toBeDefined()
    expect(row.id).toBe(1)
    expect(row.loadingTimeLimit).toBeDefined()
    expect(row.loadingTimeLimit).toBe(5)
    expect(row.questionTimeLimit).toBeDefined()
    expect(row.questionTimeLimit).toBe(2)
  })

  it('should omit the version column from returned set', async () => {
    await sql.query('SELECT * FROM Settings')
    const actual = await sql.query('SELECT * FROM Settings')
    expect(actual).toBeDefined()
    const row = actual[0]
    expect(row.version).toBeUndefined()
  })

  it('dates should be stored as UTC and preserve up to 3 millseconds', async () => {
    const fullDateFormat = '2017-07-16T14:01:02.123+01:00'
    const britishSummerTimeValue = moment(fullDateFormat)
    console.log('moment.format:', britishSummerTimeValue.format(fullDateFormat))
    const updatedAtParam = {
      name: 'updatedAt',
      type: TYPES.NVarChar,
      value: britishSummerTimeValue.format(fullDateFormat)
    }
    const idParam = {
      name: 'id',
      type: TYPES.Int,
      value: 1
    }
    const updateSql = 'UPDATE Settings SET questionTimeLimit=5, updatedAt=@updatedAt WHERE id=@id'
    try {
      await sql.modify(updateSql, [updatedAtParam, idParam])
    } catch (err) {
      console.log(err)
      fail(err)
    }
    const selectSql = 'SELECT updatedAt FROM Settings WHERE id=@id'
    let results
    try {
      results = await sql.query(selectSql, [idParam])
    } catch (err) {
      console.log(err)
      fail(err)
    }
    try {
      expect(results.length).toBe(1)
      const row = results[0]
      expect(row.updatedAt).toBeDefined()
      console.log('raw stored date:', row.updatedAt)
      const actualDateTime = moment(row.updatedAt)
      console.log('stored date to string:', actualDateTime.toString())
      const utcOffset = moment.parseZone(actualDateTime).utcOffset()
      expect(utcOffset).toBe(60)
      expect(actualDateTime.milliseconds()).toBe(123)
    } catch (err) {
      fail(err)
    }

    /* console.log('utcOffset:', utcOffset)
    console.log('actual:', actualDateTime)
    console.log('expected:', britishSummerTimeValue)
    expect(actualDateTime.toISOString()).toBe(britishSummerTimeValue.toISOString()) */
  })

  it('should store the timezone offset with the datetime value', async () => {
    const updatedAtDate = moment('2017-12-01T15:00:00.000-08:00')
    const updatedAtParam = {
      name: 'updatedAt',
      type: TYPES.DateTimeOffset,
      value: updatedAtDate.toISOString()
    }
    const idParam = {
      name: 'id',
      type: TYPES.Int,
      value: 1
    }
    const updateSql = 'UPDATE Settings SET questionTimeLimit=5, updatedAt=@updatedAt WHERE id=@id'
    try {
      await sql.modify(updateSql, [updatedAtParam, idParam])
    } catch (err) {
      console.log(err)
      fail(err)
      return
    }
    const selectSql = 'SELECT updatedAt FROM Settings WHERE id=@id'
    let results
    try {
      results = await sql.query(selectSql, [idParam])
    } catch (err) {
      console.log(err)
      fail(err)
      return
    }
    try {
      expect(results.length).toBe(1)
      const row = results[0]
      expect(row.updatedAt).toBeDefined()
      const actualDateTime = moment(row.updatedAt)
      const utcOffset = moment.parseZone(actualDateTime).utcOffset()
      console.log('utcOffset:', utcOffset)
      console.log('actual:', actualDateTime)
      console.log('expected:', updatedAtDate)
      expect(actualDateTime.toISOString()).toBe(updatedAtDate.toISOString())
    } catch (err) {
      console.log(err)
      fail(err)
    }
  })
})
