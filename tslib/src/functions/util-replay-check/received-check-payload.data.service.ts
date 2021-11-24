import { TYPES } from 'mssql'
import { ISqlParameter, ISqlService, SqlService } from '../../sql/sql.service'

export interface IReceivedCheckPayloadDataService {
  fetchCompressedArchive (checkCode: string): Promise<string | undefined>
}

export class ReceivedCheckPayloadDataService implements IReceivedCheckPayloadDataService {
  private readonly sqlService: ISqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  async fetchCompressedArchive (checkCode: string): Promise< | undefined> {
    const sql = 'SELECT archive FROM mtc_admin.receivedCheck WHERE RowKey=@checkCode'
    const params: ISqlParameter[] = [
      {
        name: 'checkCode',
        type: TYPES.UniqueIdentifier,
        value: checkCode
      }
    ]
    return this.sqlService.query(sql, params)
  }
}
