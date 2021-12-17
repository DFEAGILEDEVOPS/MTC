import { TYPES } from 'mssql'
import { isArray } from 'ramda-adjunct'
import { ISqlParameter, ISqlService, SqlService } from '../../sql/sql.service'

export interface IReceivedCheckPayloadDataService {
  fetchCompressedArchive (checkCode: string): Promise<string | undefined>
  fetchArchivesForSchool (schoolUuid: string): Promise<IArchiveEntry[]>
}

export interface IArchiveEntry {
  checkCode: string
  archive: string
}

export class ReceivedCheckPayloadDataService implements IReceivedCheckPayloadDataService {
  private readonly sqlService: ISqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  async fetchCompressedArchive (checkCode: string): Promise<string | undefined> {
    const sql = 'SELECT archive FROM mtc_admin.receivedCheck WHERE RowKey=@checkCode'
    const params: ISqlParameter[] = [
      {
        name: 'checkCode',
        type: TYPES.UniqueIdentifier,
        value: checkCode
      }
    ]
    const result = await this.sqlService.query(sql, params)
    if (!isArray(result)) return undefined
    if (result.length === 0) return undefined
    return result[0].archive
  }

  async fetchArchivesForSchool (schoolUuid: string): Promise<IArchiveEntry[]> {
    const sql = `
      SELECT chk.checkCode, r.archive FROM mtc_admin.[check] chk
      INNER JOIN mtc_admin.pupil p ON chk.pupil_id = p.id
      INNER JOIN mtc_admin.school s ON p.school_id = s.id
      INNER JOIN mtc_admin.receivedCheck r ON r.RowKey = chk.checkCode
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
