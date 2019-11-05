import { IPupil } from './models'
import { SqlService } from '../../sql/sql.service'
import mssql from 'mssql'

export interface ICheckAllocationDataService {
  /**
   * @description fetches all pupils within a particular school
   * @param schoolUUID the urlSlug of the school
   * @returns an array of pupils within the school
   */
  getPupilsBySchoolUuid (schoolUUID: string): Promise<Array<IPupil>>
  /**
   * @description gets all forms used by pupil
   * @param pupilUUID the urlSlug of the pupil
   * @returns an array of form ids
   */
  getFormsUsedByPupil (pupilUUID: string): Promise<Array<any>>
}

export class CheckAllocationDataService implements ICheckAllocationDataService {

  private sqlService: SqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  async getFormsUsedByPupil (pupilUUID: string): Promise<any[]> {
    throw new Error('Method not implemented.')
  }

  async getPupilsBySchoolUuid (schoolUUID: string): Promise<Array<IPupil>> {
    const sql = `SELECT p.urlSlug FROM mtc_admin.pupil p
      INNER JOIN mtc_admin.school s ON p.school_id = s.id
      WHERE s.urlSlug=@schoolUUID`
    const params = [
      {
        name: '@schoolUUID',
        type: mssql.UniqueIdentifier,
        value: schoolUUID
      }]
    return this.sqlService.query(sql, params)
  }
}
