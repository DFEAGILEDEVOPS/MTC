'use strict'
/* global describe beforeAll it expect fail xit spyOn */

const moment = require('moment')
const R = require('ramda')
const logger = require('../services/log.service').getLogger()
require('dotenv').config()
const sql = require('../services/data-access/sql.service')
const TYPES = sql.TYPES
const uuid = require('uuid/v4')

describe('sql.service:integration', () => {
  beforeAll(async () => {
    await sql.initPool()
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

  it('should not permit ALTER TABLE operation to mtc application user', async () => {
    try {
      await sql.query(`ALTER TABLE [mtc_admin].settings DROP COLUMN checkTimeLimit`)
      fail('ALTER TABLE operation should not have succeeded')
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

  it('should not permit CREATE VIEW operation to mtc application user', async () => {
    try {
      await sql.query(`
      CREATE VIEW [mtc_admin].[vewSettings]
      AS SELECT * FROM [mtc_admin].settings
      `)
      fail('CREATE VIEW operation should not have succeeded')
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

  it('should not permit ALTER VIEW operation to mtc application user', async () => {
    try {
      await sql.query(`
      ALTER VIEW [mtc_admin].[vewPupilsWithActiveFamiliarisationPins]
      AS SELECT * FROM [mtc_admin].settings
      `)
      fail('ALTER VIEW operation should not have succeeded')
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

  it('should not permit DROP VIEW operation to mtc application user', async () => {
    try {
      await sql.query(`DROP VIEW [mtc_admin].[vewPupilsWithActiveFamiliarisationPins]`)
      fail('DROP VIEW operation should not have succeeded')
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

  it('should not permit CREATE TRIGGER operation to mtc application user', async () => {
    try {
      await sql.query(`
      CREATE TRIGGER [mtc_admin].[settingsCreatedAtTrigger]
        ON [mtc_admin].[settings] FOR UPDATE
        AS
        BEGIN
          UPDATE [mtc_admin].[settings]
          SET createdAt = GETUTCDATE()
          FROM inserted
          WHERE [settings].id = inserted.id
        END
      `)
      fail('CREATE TRIGGER operation should not have succeeded')
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

  it('should not permit DROP TRIGGER operation to mtc application user', async () => {
    try {
      await sql.query(`DROP TRIGGER IF EXISTS [mtc_admin].[settingsUpdatedAtTrigger]`)
      fail('DROP TRIGGER operation should not have succeeded')
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
    expect(row.loadingTimeLimit).toBe(3)
    expect(row.questionTimeLimit).toBe(6)
  })

  it('should omit the version column from returned set', async () => {
    await sql.query('SELECT * FROM Settings')
    const actual = await sql.query('SELECT * FROM Settings')
    expect(actual).toBeDefined()
    const row = actual[0]
    expect(row.version).toBeUndefined()
  })

  it('dates should be stored as UTC and preserve a less than 1000 milliseconds difference', async () => {
    const fullDateFormat = moment.now()
    const britishSummerTimeValue = moment(fullDateFormat)
    const updatedAtParam = {
      name: 'updatedAt',
      type: TYPES.DateTimeOffset,
      value: britishSummerTimeValue
    }
    const idParam = {
      name: 'id',
      type: TYPES.Int,
      value: 1
    }
    const updateSql = 'UPDATE Settings SET questionTimeLimit=6, updatedAt=@updatedAt WHERE id=@id'
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
      expect(utcOffset).toBe(0)
      const duration = moment.duration(actualDateTime.diff(britishSummerTimeValue))
      const diffInMilliseconds = duration.asMilliseconds()
      expect(diffInMilliseconds).toBeLessThan(1000)
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
    const row = await sql.findOneById('[user]', 4)
    expect(row).toBeDefined()
    expect(row['id']).toBe(4)
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
        identifier: 'integration-test-' + uuid(),
        school_id: 5,
        role_id: 3
      }
      const res = await sql.create('[user]', user)
      expect(res).toBeDefined()
      expect(res.insertId).toBeDefined()
      // mssql provides an array of rowsAffected; which one is for our query?
      // expect(res.rowsModified).toBe(1)
      const retrievedUser = await sql.findOneById('[user]', res.insertId)
      expect(retrievedUser).toBeDefined()
      expect(retrievedUser.identifier).toBe(user.identifier)
      expect(retrievedUser.school_id).toBe(user.school_id)
      expect(retrievedUser.role_id).toBe(user.role_id)
    })

    it('should allow an nvarchar col to be added', async () => {
      const data = { tNvarCharMax: 'the quick brown fox' }
      const res = await sql.create('[integrationTest]', data)
      expect(res.insertId).toBeDefined()
    })

    it('returns datetimeoffset columns as Moment objects', async () => {
      const date = moment()

      // test-setup save a date
      const data = { tDateTimeOffset: date.toDate() }
      const res = await sql.create('integrationTest', data)
      expect(res.insertId).toBeDefined()

      // fetch the record
      const res2 = await sql.findOneById('integrationTest', res.insertId)
      expect(res2.tDateTimeOffset).toBeDefined()
      expect(moment.isMoment(res2.tDateTimeOffset)).toBeTruthy()
    })
  })

  describe('Inserts', () => {
    it('a single insert returns nothing', async () => {
      const stm = `INSERT INTO [mtc_admin].[integrationTest] (tNVarChar) VALUES ('test 42')`
      const res = await sql.modify(stm)
      expect(R.isEmpty(res)).toBe(true)
    })

    it('a single insert with a scope_identity request returns the identity of the inserted row', async () => {
      const stm = `INSERT INTO [mtc_admin].[integrationTest] (tNVarChar) VALUES ('test 43'); SELECT SCOPE_IDENTITY() as SCOPE_IDENTITY`
      const res = await sql.modify(stm)
      expect(res.insertId).toBeDefined()
    })

    it('a multiple insert returns nothing', async () => {
      const stm = `INSERT INTO [mtc_admin].[integrationTest] (tNVarChar) VALUES ('test 44'), ('test 45')`
      const res = await sql.modify(stm)
      expect(R.isEmpty(res)).toBe(true)
    })

    it('a multiple insert with an output table returns the identities of the inserted rows', async () => {
      const stm = `DECLARE @output TABLE (id int);
      INSERT INTO [mtc_admin].[integrationTest] (tNVarChar) 
        OUTPUT inserted.ID INTO @output
        VALUES ('test 46'), ('test 47'); 
      SELECT * from @output`
      const res = await sql.modify(stm)
      expect(R.empty(res)).toBeTruthy()
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
      await sql.update('[school]', update)
      // expect(result.rowsModified).toBe(1)

      // read the school back and check
      const school2 = await sql.findOneById('[school]', 1)
      expect(school2.pin).toBe(pin)
      const duration = moment.duration(school2.pinExpiresAt.diff(expiry))
      const diffInMilliseconds = duration.asMilliseconds()
      expect(diffInMilliseconds).toBeLessThan(1000)
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
         SELECT SCOPE_IDENTITY() as SCOPE_IDENTITY;`,
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
      const value = 96.489
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
         SELECT SCOPE_IDENTITY() as SCOPE_IDENTITY;`,
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
         SELECT SCOPE_IDENTITY() as SCOPE_IDENTITY;`,
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
         SELECT SCOPE_IDENTITY() as SCOPE_IDENTITY;`,
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
      spyOn(logger, 'warn')
      try {
        await sql.create(table, data)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBeDefined()
      }
    })
  })
})
