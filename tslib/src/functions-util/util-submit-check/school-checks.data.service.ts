import { TYPES } from 'mssql'
import { type ISqlParameter, type ISqlService, SqlService } from '../../sql/sql.service'

export interface ISchoolChecksDataService {
  fetchBySchoolUuid (schoolUuid: string): Promise<string[]>
}

export interface ICheckCodeRecord {
  checkCode: string
}

export class SchoolChecksDataService {
  private readonly sqlService: ISqlService

  constructor (sqlService?: ISqlService) {
    if (sqlService === undefined) {
      sqlService = new SqlService()
    }
    this.sqlService = sqlService
  }

  async fetchBySchoolUuid (schoolUuid: string): Promise<ICheckCodeRecord[]> {
    const sql = `
      SELECT checkCode FROM mtc_admin.[check] chk
      INNER JOIN mtc_admin.pupil p ON chk.pupil_id = p.id
      INNER JOIN mtc_admin.school s ON p.school_id = s.id
      WHERE s.urlSlug = @schoolUuid
      AND chk.complete = 0 AND chk.processingFailed = 0
      AND chk.isLiveCheck = 1 AND chk.received = 0
    `
    const param: ISqlParameter = {
      name: 'schoolUuid',
      type: TYPES.UniqueIdentifier,
      value: schoolUuid
    }
    return this.sqlService.query(sql, [param])
  }
}
