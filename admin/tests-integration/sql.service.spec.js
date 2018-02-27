'use strict'
/* global describe beforeAll it expect fail xit spyOn */

const moment = require('moment')
const R = require('ramda')
const TYPES = require('tedious').TYPES
const winston = require('winston')
const dateService = require('../services/date.service')

require('dotenv').config()
const sql = require('../services/data-access/sql.service')
const sqlPool = require('../services/data-access/sql.pool.service')

describe('sql.service:integration', () => {
  beforeAll(async () => {
    sqlPool.init()
    await sql.updateDataTypeCache()
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
    expect(row.loadingTimeLimit).toBe(2)
    expect(row.questionTimeLimit).toBe(5)
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
    const updatedAtParam = {
      name: 'updatedAt',
      type: TYPES.NVarChar,
      value: dateService.formatIso8601(britishSummerTimeValue)
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
      const actualDateTime = moment(row.updatedAt)
      const utcOffset = moment.parseZone(actualDateTime).utcOffset()
      expect(utcOffset).toBe(60)
      expect(actualDateTime.milliseconds()).toBe(123)
      expect(actualDateTime.toISOString()).toBe(britishSummerTimeValue.toISOString())
    } catch (err) {
      fail(err)
    }
  })

  xit('should store the timezone offset with the datetime value', async () => {
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

  it('#findOneById should retrieve a row', async () => {
    const row = await sql.findOneById('[user]', 3)
    expect(row).toBeDefined()
    expect(row['id']).toBe(3)
    expect(row['identifier']).toBe('teacher3')
    expect(row['school_id']).toBe(4)
    expect(row['role_id']).toBe(3)
  })

  it('#findOneById should prevent sql injection', async () => {
    const row = await sql.findOneById('[user]', '3 OR 1=1')
    // We still expect to get the object where id=3 as running parseInt('3 OR 1=1')
    // still gives numeric 3.  If sql injection was allowed we would get all users.
    expect(typeof row).toBe('object')
  })

  describe('#create', () => {
    it('should insert a new row and provide the new insert id', async () => {
      const user = {
        identifier: 'integration-test',
        school_id: 5,
        role_id: 3
      }
      const res = await sql.create('[user]', user)
      expect(res).toBeDefined()
      expect(res.insertId).toBeDefined()
      expect(res.rowsModified).toBe(1)
      const retrievedUser = await sql.findOneById('[user]', res.insertId)
      expect(retrievedUser).toBeDefined()
      expect(retrievedUser.identifier).toBe(user.identifier)
      expect(retrievedUser.school_id).toBe(user.school_id)
      expect(retrievedUser.role_id).toBe(user.role_id)
    })
  })

  describe('#update', () => {
    it('should update a record', async () => {
      const school = await sql.findOneById('[school]', 1)
      const pin = 'zzz98765'
      const expiry = moment().add(4, 'hours')
      const update = R.pick(['id', 'pin', 'pinExpiresAt'], school)
      update.pin = pin
      update.pinExpiresAt = expiry.clone()
      const result = await sql.update('[school]', update)
      expect(result.rowsModified).toBe(1)

      // read the school back and check
      const school2 = await sql.findOneById('[school]', 1)
      expect(school2.pin).toBe(pin)
      expect(school2.pinExpiresAt.toISOString()).toBe(expiry.toISOString())
    })
  })

  describe('data type handling', () => {
    const table = '[integrationTest]'

    it('allows a decimal type to be set manually', async () => {
      const value = 3.14
      const params = [{
        name: 'tDecimal',
        value: value,
        type: TYPES.Decimal,
        precision: 5,
        scale: 2
      }]
      const insertResult = await sql.modify(`
         INSERT into ${table} (tDecimal) 
         VALUES (@tDecimal);
         SELECT @@IDENTITY;`,
        params)
      if (!insertResult.insertId) {
        return fail('insertId expected')
      }
      const t = await sql.findOneById(table, insertResult.insertId)
      expect(t.tDecimal).toEqual(value)
    })

    it('allows a decimal type to be set automatically on create', async () => {
      const data = { tDecimal: 6.02 }
      const res = await sql.create(table, data)
      const t = await sql.findOneById(table, res.insertId)
      expect(t.tDecimal).toEqual(data.tDecimal)
    })

    it('allows a decimal type to be set automatically on update', async () => {
      const data = { tDecimal: 6.99 }
      const res = await sql.create(table, data)
      const t = await sql.findOneById(table, res.insertId)
      await sql.update(table, { id: t.id, tDecimal: 7.01 })
      const t2 = await sql.findOneById(table, t.id)
      expect(t2.tDecimal).toEqual(7.01)
    })

    it('allows a numeric type to be set manually', async () => {
      const value = 96.486
      const params = [{
        name: 'tNumeric',
        value: value,
        type: TYPES.Numeric,
        precision: 5,
        scale: 3
      }]
      const insertResult = await sql.modify(`
         INSERT into ${table} (tNumeric) 
         VALUES (@tNumeric);
         SELECT @@IDENTITY;`,
        params)
      if (!insertResult.insertId) {
        return fail('insertId expected')
      }
      const t = await sql.findOneById(table, insertResult.insertId)
      expect(t.tNumeric).toEqual(value)
    })

    it('allows a numeric type to be set automatically on create', async () => {
      const data = { tNumeric: 1.660 }
      const res = await sql.create(table, data)
      const t = await sql.findOneById(table, res.insertId)
      expect(t.tNumeric).toEqual(data.tNumeric)
    })

    it('allows a numeric type to be set automatically on update', async () => {
      const data = { tNumeric: 1.380 }
      const res = await sql.create(table, data)
      const t = await sql.findOneById(table, res.insertId)
      await sql.update(table, { id: t.id, tNumeric: 2.381 })
      const t2 = await sql.findOneById(table, t.id)
      expect(t2.tNumeric).toEqual(2.381)
    })

    it('allows a float type to be set manually', async () => {
      const value = 9.80665
      const params = [{
        name: 'tFloat',
        value: value,
        type: TYPES.Float
      }]
      const insertResult = await sql.modify(`
         INSERT into ${table} (tFloat) 
         VALUES (@tFloat);
         SELECT @@IDENTITY;`,
        params)
      if (!insertResult.insertId) {
        return fail('insertId expected')
      }
      const t = await sql.findOneById(table, insertResult.insertId)
      expect(t.tFloat).toBeCloseTo(value, 5)
    })

    it('allows a float type to be set automatically on create', async () => {
      const data = { tFloat: 9.80665 }
      const res = await sql.create(table, data)
      const t = await sql.findOneById(table, res.insertId)
      expect(t.tFloat).toBeCloseTo(data.tFloat, 5)
    })

    it('allows a float type to be set automatically on update', async () => {
      const data = { tFloat: 9.80665 }
      const res = await sql.create(table, data)
      const t = await sql.findOneById(table, res.insertId)
      await sql.update(table, { id: t.id, tFloat: 10.12345 })
      const t2 = await sql.findOneById(table, t.id)
      expect(t2.tFloat).toBeCloseTo(10.12345, 5)
    })

    it('allows a nvarchar to set manually', async () => {
      const value = 'the quick' // 9 chars, col length is 10
      const params = [{
        name: 'tNvarchar',
        value: value,
        type: TYPES.NVarChar
      }]
      const insertResult = await sql.modify(`
         INSERT into ${table} (tNvarchar) 
         VALUES (@tNvarchar);
         SELECT @@IDENTITY;`,
        params)
      if (!insertResult.insertId) {
        return fail('insertId expected')
      }
      const t = await sql.findOneById(table, insertResult.insertId)
      expect(t.tNvarchar).toBe('the quick')
    })

    it('allows a nvarchar to be set automatically on create', async () => {
      const data = { tNvarchar: 'brown fox' } // 9 chars col length is 10
      const res = await sql.create(table, data)
      const t = await sql.findOneById(table, res.insertId)
      expect(t.tNvarchar).toBe(data.tNvarchar)
    })

    it('raises an error on CREATE when the nvarchar provided is too long', async () => {
      const data = { tNvarchar: 'the quick brown fox' } // 19 chars col length is 10
      // This will generate a warning because of the error, we can shut that up for this test
      spyOn(winston, 'warn')
      try {
        await sql.create(table, data)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('String or binary data would be truncated.') // vendor message
      }
    })
  })
})
