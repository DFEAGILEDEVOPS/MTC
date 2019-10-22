import * as sql from './sql.service'
import config from '../config'
import { ConsoleLogger } from '../common/ILogger'
import * as RA from 'ramda-adjunct'
import { isMoment } from 'moment'
import * as mssql from 'mssql'

let sut: sql.SqlService

describe.only('SqlService', () => {
  beforeEach(async () => {
    sut = new sql.SqlService(config.Sql, new ConsoleLogger())
    await sut.init()
  })

  afterEach(async () => {
    await sut.close()
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('single row results are transformed and returned as a single array', async () => {
    const sql = 'SELECT TOP 1 * FROM [mtc_admin].school'
    const result = await sut.query(sql)
    expect(result).toBeDefined()
    expect(RA.isArray(result)).toBe(true)
    expect(result.length).toBe(1)
  })

  test('multi row results are transformed and returned as a single array', async () => {
    const sql = 'SELECT TOP 4 * FROM [mtc_admin].school'
    const result = await sut.query(sql)
    expect(result).toBeDefined()
    expect(RA.isArray(result)).toBe(true)
    expect(result.length).toBe(4)
  })

  test('date columns are converted to moment objects', async () => {
    const sql = 'SELECT TOP 1 * FROM [mtc_admin].school'
    const result = await sut.query(sql)
    expect(result).toBeDefined()
    expect(RA.isArray(result)).toBe(true)
    expect(result.length).toBe(1)
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
    expect(result.length).toBe(1)
    const school = result[0]
    expect(RA.isObj(school)).toBe(true)
    expect(school.id).toEqual(schoolId)
  })
})
