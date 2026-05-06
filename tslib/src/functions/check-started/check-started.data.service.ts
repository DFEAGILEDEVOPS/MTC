import { TYPES } from 'mssql'
import { type IModifyResult, SqlService } from '../../sql/sql.service'

export class CheckStartedDataService implements ICheckStartedDataService {
  private readonly sqlService: SqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  async updateCheckStartedDate (checkCode: string, checkStartedDateTime: Date): Promise<IModifyResult> {
    const sql = `UPDATE [mtc_admin].[check]
                    SET startedAt = @startedAt
                  WHERE checkCode = @checkCode
                    AND startedAt IS NULL`
    const params = [
      { name: 'startedAt', value: checkStartedDateTime, type: TYPES.DateTimeOffset },
      { name: 'checkCode', value: checkCode, type: TYPES.UniqueIdentifier }
    ]
    return this.sqlService.modify(sql, params)
  }
}

export interface ICheckStartedDataService {
  updateCheckStartedDate (checkCode: string, checkStartedDateTime: Date): Promise<IModifyResult>
}
