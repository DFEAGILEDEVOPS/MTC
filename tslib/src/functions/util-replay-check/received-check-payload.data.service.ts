import { TYPES } from 'mssql'
import { isArray } from 'ramda-adjunct'
import { ISqlParameter, ISqlService, SqlService } from '../../sql/sql.service'

export interface IReceivedCheckPayloadDataService {
  fetchCompressedArchive (checkCode: string): Promise<string | undefined>
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
}
