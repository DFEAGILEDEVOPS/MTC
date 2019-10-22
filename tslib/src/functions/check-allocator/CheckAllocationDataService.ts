import { IPupil } from './Models'
import { SqlService } from '../../sql/sql.service'
import mssql from 'mssql'

export interface ICheckAllocationDataService {
  /**
   * @description fetches all pupils within a particular school
   * @param schoolUUID the urlSlug of the school
   * @returns an array of pupils within the school
   */
  getPupilsBySchoolUuid (schoolUUID: string): Promise<Array<IPupil>>
}

export class CheckAllocationDataService implements ICheckAllocationDataService {

  private _sqlService: SqlService

  constructor () {
    this._sqlService = new SqlService()
  }

  async getPupilsBySchoolUuid (schoolUUID: string): Promise<Array<IPupil>> {
    const sql = `p.urlSlug FROM mtc_admin.pupil p
      INNER JOIN mtc_admin.school s ON p.school_id = s.id
      WHERE s.urlSlug=@schoolUUID`
    const params = [
      {
        name: '@schoolUUID',
        type: mssql.UniqueIdentifier,
        value: schoolUUID
      }]
    return this._sqlService.query(sql, params)
  }
}
