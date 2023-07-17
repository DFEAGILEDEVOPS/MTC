import { TYPES } from 'mssql'
import { isArray } from 'ramda-adjunct'
import { type ISqlParameter, type ISqlService, SqlService } from '../../sql/sql.service'

export interface IReceivedCheckPayloadDataService {
  fetchCompressedArchives (checkCodes: string[]): Promise<string[]>
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

  async fetchCompressedArchives (checkCodes: string[]): Promise<string[]> {
    const params: ISqlParameter[] = []
    const paramIds: string[] = []
    for (let index = 0; index < checkCodes.length; index++) {
      const checkCode = checkCodes[index]
      params.push({
        name: `checkCode${index}`,
        type: TYPES.UniqueIdentifier,
        value: checkCode
      })
      paramIds.push(`@checkCode${index}`)
    }
    const sql = `SELECT archive FROM mtc_admin.receivedCheck WHERE RowKey IN (${paramIds.join(',')})`
    const result = await this.sqlService.query(sql, params)
    if (!isArray(result)) return []
    if (result.length === 0) return []
    return result.map(r => r.archive)
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
