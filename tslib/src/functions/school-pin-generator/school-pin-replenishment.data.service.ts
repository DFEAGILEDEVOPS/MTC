import { SqlService } from '../../sql/sql.service'
import { School, SchoolPinUpdate } from './school-pin-replenishment.service'

export interface ISchoolPinReplenishmentDataService {
  getSchoolData (): Promise<School[]>
  updatePin (schoolPinUpdate: SchoolPinUpdate): Promise<void>
}

export class SchoolPinReplenishmentDataService implements ISchoolPinReplenishmentDataService {
  private sqlService: SqlService
  constructor () {
    this.sqlService = new SqlService()
  }
  getSchoolData (): Promise<School[]> {
    const sql = `
    SELECT s.id, s.name,  s.pinExpiresAt, s.pin, sce.id, sce.timezone
    FROM mtc_admin.school s
    LEFT OUTER JOIN mtc_admin.sce ON s.id = sce.school_id
    WHERE s.pinExpiresAt <= GETUTCDATE()`
    return this.sqlService.query(sql)
  }
  updatePin (school: SchoolPinUpdate): Promise<void> {
    throw new Error('not implemented')
  }
}
