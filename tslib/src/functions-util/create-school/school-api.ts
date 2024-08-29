import { type ISqlService, SqlService } from '../../sql/sql.service'
import { ConsoleLogger, type ILogger } from '../../common/logger'
import { TYPES } from 'mssql'
import * as R from 'ramda'

export class SchoolApi {
  private readonly sqlService: ISqlService
  private readonly logger: ILogger

  constructor (logger?: ILogger, sqlService?: ISqlService) {
    this.logger = logger ?? new ConsoleLogger()
    this.sqlService = sqlService ?? new SqlService(this.logger)
  }

  public async create (newSchoolInfo: INewSchoolModel): Promise<object> {
    if (newSchoolInfo === undefined) {
      throw new Error('school to be created is required')
    }
    if (newSchoolInfo.leaCode === undefined) {
      throw new Error('leaCode is required')
    }
    if (newSchoolInfo.estabCode === undefined) {
      throw new Error('estabCode is required')
    }
    if (newSchoolInfo.name === undefined) {
      throw new Error('name is required')
    }
    if (newSchoolInfo.urn === undefined) {
      throw new Error('urn is required')
    }
    this.logger.trace('SchoolAPI: create() called')
    const { leaCode, estabCode, name, urn } = newSchoolInfo
    const sql = `INSERT INTO mtc_admin.school (leaCode, estabCode, name, urn, dfeNumber)
                 VALUES (@leaCode, @estabCode, @name, @urn, @dfeNumber)`
    const dfeNumber = parseInt(leaCode.toString().concat(estabCode.toString()), 10)
    const params = [
      { name: 'name', value: name.trim(), type: TYPES.NVarChar },
      { name: 'estabCode', value: estabCode, type: TYPES.Int },
      { name: 'leaCode', value: leaCode, type: TYPES.Int },
      { name: 'urn', value: urn, type: TYPES.Int },
      { name: 'dfeNumber', value: dfeNumber, type: TYPES.Int }
    ]
    await this.sqlService.modify(sql, params)
    const data = await this.sqlService.query('SELECT * from mtc_admin.school WHERE dfeNumber = @dfeNumber', [{
      name: 'dfeNumber',
      value: dfeNumber,
      type: TYPES.Int
    }])
    // @ts-ignore - ramda and ts!
    return R.head(data)
  }
}

export interface INewSchoolModel {
  leaCode: number
  estabCode: number
  name: string
  urn: number
}
