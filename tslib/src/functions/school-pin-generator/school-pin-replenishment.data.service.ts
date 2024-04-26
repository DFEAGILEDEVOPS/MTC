import { SqlService, type ISqlParameter, type IModifyResult } from '../../sql/sql.service'
import { type School, type SchoolPinUpdate } from './school-pin-replenishment.service'
import { TYPES } from 'mssql'

export interface ISchoolPinReplenishmentDataService {
  getAllSchools (): Promise<School[]>
  updatePin (schoolPinUpdate: SchoolPinUpdate): Promise<IModifyResult>
  getSchoolById (id: number): Promise<School | undefined>
}

export class SchoolPinReplenishmentDataService implements ISchoolPinReplenishmentDataService {
  private readonly sqlService: SqlService
  constructor () {
    this.sqlService = new SqlService()
  }

  async getSchoolById (id: number): Promise<School | undefined> {
    const sql = `
    SELECT
      s.id,
      s.name,
      s.pinExpiresAt,
      s.pin,
      sce.timezone
    FROM
      mtc_admin.school s
    LEFT OUTER JOIN
      mtc_admin.sce ON (s.id = sce.school_id)
    WHERE
      s.id = @school_id
    AND
      (s.pinExpiresAt <= GETUTCDATE() OR s.pinExpiresAt IS NULL)`
    const param: ISqlParameter = {
      name: 'school_id',
      type: TYPES.Int,
      value: id
    }
    const result = await this.sqlService.query(sql, [param])
    if (result === undefined || result.length === 0) return undefined
    return {
      id: result[0].id,
      name: result[0].name,
      pinExpiresAt: result[0].pinExpiresAt,
      timezone: result[0].timezone
    }
  }

  async getAllSchools (): Promise<School[]> {
    const sql = `
    SELECT s.id, s.name,  s.pinExpiresAt, s.pin, sce.timezone
    FROM mtc_admin.school s
    LEFT OUTER JOIN mtc_admin.sce ON s.id = sce.school_id
    WHERE s.pinExpiresAt <= GETUTCDATE()
    OR s.pinExpiresAt IS NULL`
    return this.sqlService.query(sql)
  }

  async updatePin (school: SchoolPinUpdate): Promise<IModifyResult> {
    const sql = `UPDATE [mtc_admin].[school]
    SET pinExpiresAt=@pinExpiresAt,
    pin=@pin
    WHERE id=@schoolId`
    const params: ISqlParameter[] = [
      {
        name: 'schoolId',
        value: school.id,
        type: TYPES.Int
      },
      {
        name: 'pinExpiresAt',
        value: school.pinExpiresAt.toDate(),
        type: TYPES.DateTimeOffset(3)
      },
      {
        name: 'pin',
        value: school.newPin,
        type: TYPES.Char(8)
      }
    ]
    return this.sqlService.modify(sql, params)
  }
}
