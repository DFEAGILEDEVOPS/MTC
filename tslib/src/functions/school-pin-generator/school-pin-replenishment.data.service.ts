import { SqlService, ISqlParameter } from '../../sql/sql.service'
import { School, SchoolPinUpdate } from './school-pin-replenishment.service'
import { TYPES } from 'mssql'

export interface ISchoolPinReplenishmentDataService {
  getAllSchools (): Promise<School[]>
  updatePin (schoolPinUpdate: SchoolPinUpdate): Promise<void>
  getSchoolByUuid (uuid: string): Promise<School>
}

export class SchoolPinReplenishmentDataService implements ISchoolPinReplenishmentDataService {

  private sqlService: SqlService
  constructor () {
    this.sqlService = new SqlService()
  }

  getSchoolByUuid (uuid: string): Promise<School> {
    const sql = `
    SELECT s.id, s.name,  s.pinExpiresAt, s.pin, sce.id, sce.timezone
    FROM mtc_admin.school s
    LEFT OUTER JOIN mtc_admin.sce ON s.id = sce.school_id
    WHERE s.urlSlug = @schoolUuid`
    // TODO do only if expired?????
    const param: ISqlParameter = {
      name: 'schoolUuid',
      type: TYPES.UniqueIdentifier,
      value: uuid
    }
    return this.sqlService.query(sql, [param])
  }

  getAllSchools (): Promise<School[]> {
    const sql = `
    SELECT s.id, s.name,  s.pinExpiresAt, s.pin, sce.id, sce.timezone
    FROM mtc_admin.school s
    LEFT OUTER JOIN mtc_admin.sce ON s.id = sce.school_id
    WHERE s.pinExpiresAt <= GETUTCDATE()
    OR s.pinExpiresAt IS NULL`
    return this.sqlService.query(sql)
  }

  updatePin (school: SchoolPinUpdate): Promise<void> {
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
