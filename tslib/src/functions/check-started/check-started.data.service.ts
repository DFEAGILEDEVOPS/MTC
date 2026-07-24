import { TYPES } from 'mssql'
import { type IModifyResult, SqlService } from '../../sql/sql.service.js'

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

  async isLiveCheck (checkCode: string): Promise<boolean> {
    const sql = `SELECT isLiveCheck FROM [mtc_admin].[check] WHERE checkCode = @checkCode`
    const params = [
      { name: 'checkCode', value: checkCode, type: TYPES.UniqueIdentifier }
    ]
    const results = await this.sqlService.query(sql, params)
    const first = results?.[0]
    return first?.isLiveCheck === true
  }
}

export interface ICheckStartedDataService {
  updateCheckStartedDate (checkCode: string, checkStartedDateTime: Date): Promise<IModifyResult>
  isLiveCheck (checkCode: string): Promise<boolean>
}
