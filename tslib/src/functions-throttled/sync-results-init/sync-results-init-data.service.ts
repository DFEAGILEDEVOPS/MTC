import { type UnsynchronisedCheck } from './models'
import { validate as validateUUID } from 'uuid'
import { TYPES } from 'mssql'
import { type ISqlService, SqlService } from '../../sql/sql.service'

export interface ISyncResultsInitDataService {
  getUnsynchronisedChecks (): Promise<UnsynchronisedCheck[]>
  getCheckToResynchronise (checkCode: string): Promise<UnsynchronisedCheck[]>
  getSchoolToResynchonise (schoolUUID: string): Promise<UnsynchronisedCheck[]>
  getAllChecksToResynchronise (): Promise<UnsynchronisedCheck[]>
}

export class SyncResultsInitDataService implements ISyncResultsInitDataService {
  private readonly sqlService: ISqlService

  constructor (sqlService?: ISqlService) {
    this.sqlService = sqlService ?? new SqlService()
  }

  /**
   * Return a list of checks and the school UUID that need to be synchronised from the table storage marking tables to the SQL Database.
   *
   */
  async getUnsynchronisedChecks (): Promise<UnsynchronisedCheck[]> {
    const sql = `
        SELECT c.checkCode, s.urlSlug as schoolUUID
          FROM mtc_admin.[check] c
               JOIN mtc_admin.[pupil] p ON (c.pupil_id = p.id)
               JOIN mtc_admin.[school] s ON (p.school_id = s.id)
         WHERE c.complete = 1
           AND c.resultsSynchronised = 0
           AND c.isLiveCheck = 1
    `
    return this.sqlService.query(sql)
  }

  /**
   * Re-synchronise a single check
   * @param checkCode
   */
  async getCheckToResynchronise (checkCode: string): Promise<UnsynchronisedCheck[]> {
    if (!validateUUID(checkCode)) {
      throw new Error('Invalid checkCode')
    }
    const sql = `
        SELECT c.checkCode, s.urlSlug as schoolUUID
          FROM mtc_admin.[check] c
               JOIN mtc_admin.[pupil] p ON (c.pupil_id = p.id)
               JOIN mtc_admin.[school] s ON (p.school_id = s.id)
         WHERE (c.complete = 1 OR c.processingFailed = 1)
           AND c.isLiveCheck = 1
           AND c.checkCode = @checkCode
    `
    const params = [
      { name: 'checkCode', value: checkCode, type: TYPES.UniqueIdentifier }
    ]
    return this.sqlService.query(sql, params)
  }

  /**
   * Re-synchronise an entire school
   * @param schoolUUID
   */
  async getSchoolToResynchonise (schoolUUID: string): Promise<UnsynchronisedCheck[]> {
    if (!validateUUID(schoolUUID)) {
      throw new Error('Invalid schoolUUID')
    }
    const sql = `
        SELECT c.checkCode, s.urlSlug as schoolUUID
          FROM mtc_admin.[check] c
               JOIN mtc_admin.[pupil] p ON (c.pupil_id = p.id)
               JOIN mtc_admin.[school] s ON (p.school_id = s.id)
         WHERE c.complete = 1
           AND c.isLiveCheck = 1
           AND s.urlSlug = @schoolUUID
    `
    const params = [
      { name: 'schoolUUID', value: schoolUUID, type: TYPES.UniqueIdentifier }
    ]
    return this.sqlService.query(sql, params)
  }

  /**
   * Resynchronise the every completed check
   */
  async getAllChecksToResynchronise (): Promise<UnsynchronisedCheck[]> {
    const sql = `
        SELECT c.checkCode, s.urlSlug as schoolUUID
          FROM mtc_admin.[check] c
               JOIN mtc_admin.[pupil] p ON (c.pupil_id = p.id)
               JOIN mtc_admin.[school] s ON (p.school_id = s.id)
         WHERE c.complete = 1
           AND c.isLiveCheck = 1
           AND c.processingFailed = 0
    `
    return this.sqlService.query(sql)
  }
}
