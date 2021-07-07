import { TYPES } from 'mssql'
import { ISqlParameter, ISqlService, SqlService } from '../../sql/sql.service'

export class SchoolChecksDataService {
  private readonly sqlService: ISqlService

  constructor (sqlService?: ISqlService) {
    if (sqlService === undefined) {
      sqlService = new SqlService()
    }
    this.sqlService = sqlService
  }

  async fetchBySchoolUuid (schoolUuid: string): Promise<string[]> {
    const sql = `
      SELECT checkCode FROM mtc_admin.[check] chk
      INNER JOIN mtc_admin.pupil p ON chk.pupil_id = p.id
      INNER JOIN mtc_admin.school s ON p.school_id = s.id
      WHERE s.urlSlug = @schoolUuid
    `
    const param: ISqlParameter = {
      name: 'schoolUuid',
      type: TYPES.UniqueIdentifier,
      value: schoolUuid
    }
    return this.sqlService.query(sql, [param])
  }
}
