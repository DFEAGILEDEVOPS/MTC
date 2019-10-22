import * as sql from './sql.service'
import config from '../config'
import { ConsoleLogger } from '../common/ILogger'
import * as RA from 'ramda-adjunct'
import { isMoment } from 'moment'

let sut: sql.SqlService

describe('SqlService', () => {
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

  test.only('date columns are converted to moment objects', async () => {
    const sql = 'SELECT TOP 1 * FROM [mtc_admin].school'
    const result = await sut.query(sql)
    expect(result).toBeDefined()
    expect(RA.isArray(result)).toBe(true)
    expect(result.length).toBe(1)
    const school = result[0]
    expect(RA.isObj(school)).toBe(true)
    expect(school.createdAt).toBeDefined()
    expect(isMoment(school.createdAt)).toBe(true)
  })
})
