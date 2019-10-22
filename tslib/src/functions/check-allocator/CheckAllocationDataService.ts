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
  /**
   * @description gets all forms used by pupil
   * @param pupilUUID the urlSlug of the pupil
   * @returns an array of form ids
   */
  getFormsUsedByPupil (pupilUUID: string): Promise<Array<any>>
  /**
   * @description gets all available check forms
   * @returns an array of form ids
   */
  getAllForms (): Promise<Array<any>>
}

export interface ICheckWindowDataService {
  getActiveCheckWindowId (): number
}

export class CheckAllocationDataService implements ICheckAllocationDataService {

  private _sqlService: SqlService
  // TODO implement check window data service
  private checkWindowId = 1

  constructor () {
    this._sqlService = new SqlService()
  }

  // TODO cache
  async getAllForms (): Promise<any[]> {
    const sql = `SELECT cf.id FROM mtc_admin.checkForm cf
    INNER JOIN mtc_admin.checkFormWindow cfw ON cf.id = cfw.checkForm_id
    WHERE cfw.checkWindow_id=@checkWindowId AND cf.isDeleted=0`
    const params = [
      {
        name: '@checkWindowId',
        type: mssql.Int,
        value: this.checkWindowId
      }]
    return this._sqlService.query(sql, params)
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
    return this._sqlService.query(sql, params)
  }
}
