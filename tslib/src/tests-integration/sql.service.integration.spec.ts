import * as sql from '../sql/sql.service'
import * as mssql from 'mssql'
import { v4 as uuidv4 } from 'uuid'
import moment, { isMoment } from 'moment'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const RA = require('ramda-adjunct')

let sut: sql.SqlService

describe('SqlService', () => {
  beforeEach(async () => {
    sut = new sql.SqlService()
  })

  afterAll(async () => {
    await sut.closePool()
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('single row results are transformed and returned as a single array', async () => {
    const sql = 'SELECT TOP 1 * FROM [mtc_admin].school'
    const result = await sut.query(sql)
    expect(result).toBeDefined()
    expect(RA.isArray(result)).toBe(true)
    expect(result).toHaveLength(1)
  })

  test('multi row results are transformed and returned as a single array', async () => {
    const sql = 'SELECT TOP 4 * FROM [mtc_admin].school'
    const result = await sut.query(sql)
    expect(result).toBeDefined()
    expect(RA.isArray(result)).toBe(true)
    expect(result).toHaveLength(4)
  })

  test('date columns are converted to moment objects', async () => {
    const sql = 'SELECT TOP 1 * FROM [mtc_admin].school'
    const result = await sut.query(sql)
    expect(result).toBeDefined()
    expect(RA.isArray(result)).toBe(true)
    expect(result).toHaveLength(1)
    const school = result[0]
    expect(RA.isObj(school)).toBe(true)
    expect(school.createdAt).toBeDefined()
    expect(isMoment(school.createdAt)).toBe(true)
    expect(isMoment(school.name)).toBe(false)
  })

  test('supplied parameters are applied to the query', async () => {
    const schoolId = 1
    const params = [
      {
        name: 'schoolId',
        value: schoolId,
        type: mssql.Int
      }
    ]
    const sql = 'SELECT TOP 1 * FROM [mtc_admin].school WHERE id=@schoolId'
    const result = await sut.query(sql, params)
    expect(result).toBeDefined()
    expect(RA.isArray(result)).toBe(true)
    expect(result).toHaveLength(1)
    const school = result[0]
    expect(RA.isObj(school)).toBe(true)
    expect(school.id).toStrictEqual(schoolId)
  })

  test('datetime is stored with hundred millisecond accuracy', async () => {
    const isoDateTimeValue = '2000-01-01T15:00:00.123'
    const dateToModify = new Date(isoDateTimeValue)
    const sql = `UPDATE mtc_admin.[attendanceCode] SET createdAt=@createdAt
      WHERE code=@code`
    const params = [
      {
        name: 'createdAt',
        type: mssql.DateTimeOffset,
        value: dateToModify
      },
      {
        name: 'code',
        type: mssql.Char,
        value: 'ABSNT'
      }
    ]
    await sut.modify(sql, params)
    const result = await sut.query(`SELECT createdAt FROM
      mtc_admin.attendanceCode WHERE code='ABSNT'`)
    expect(result).toBeDefined()
    const record = result[0]
    expect(record.createdAt).toBeDefined()
    expect(isMoment(record.createdAt)).toBe(true)
    const dbValueAsMoment = moment(record.createdAt)
    const datesAreSame = dbValueAsMoment.isSame(moment(isoDateTimeValue))
    expect(datesAreSame).toBe(true)
    expect(dbValueAsMoment.milliseconds()).toBe(123)
  })

  test('modifyWithTransaction: rolls back all statements in the batch upon failure', async () => {
    const uuid = uuidv4()
    const requests = new Array<sql.ITransactionRequest>()
    requests.push({
      sql: `INSERT INTO mtc_admin.integrationTest (tNvarCharMax)
              VALUES ('${uuid}')`,
      params: []
    })
    requests.push({
      sql: `INSERT INTO non.existent (colname)
              VALUES ('should error')`,
      params: []
    })
    try {
      await sut.modifyWithTransaction(requests)
      fail('an error should have been thrown due to transaction failure')
    } catch (error) {
      let errorMessage = 'unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      expect(errorMessage).toBeDefined()
    }
    const sql = 'SELECT * FROM mtc_admin.integrationTest WHERE tNvarCharMax=@rowData'
    const params: sql.ISqlParameter[] = [{
      name: 'rowData',
      type: mssql.NVarChar,
      value: uuid
    }]
    const result = await sut.query(sql, params)
    expect(result).toStrictEqual([])
  })

  test('modifyWithTransaction: commits all statements in the batch when no errors are raised', async () => {
    const uuid = uuidv4()
    const requests = new Array<sql.ITransactionRequest>()
    requests.push({
      sql: `INSERT INTO mtc_admin.integrationTest (tNvarCharMax)
              VALUES ('${uuid}')`,
      params: []
    })
    requests.push({
      sql: `INSERT INTO mtc_admin.integrationTest (tNvarCharMax)
      VALUES (@uuid)`,
      params: [{
        name: 'uuid',
        type: mssql.NVarChar,
        value: uuid
      }]
    })
    try {
      await sut.modifyWithTransaction(requests)
    } catch (error) {
      let errorMessage = 'unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      fail(`an error should not have been thrown:${errorMessage}`)
    }
    const sql = 'SELECT * FROM mtc_admin.integrationTest WHERE tNvarCharMax=@uuid'
    const params: sql.ISqlParameter[] = [{
      name: 'uuid',
      type: mssql.NVarChar,
      value: uuid
    }]
    const result = await sut.query(sql, params)
    expect(RA.isArray(result)).toBe(true)
    expect(result).toHaveLength(2)
  })
})
