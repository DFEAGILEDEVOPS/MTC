import { TYPES } from 'mssql'
import { type IModifyResult, SqlService } from '../../sql/sql.service'

export interface IPupilLoginDataService {
  updateCheckWithLoginTimestamp (checkCode: string, loginDateTime: Date): Promise<IModifyResult>
}

export class PupilLoginDataService implements IPupilLoginDataService {
  private readonly sqlService: SqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  async updateCheckWithLoginTimestamp (checkCode: string, loginDateTime: Date): Promise<IModifyResult> {
    const sql = `UPDATE [mtc_admin].[check]
                    SET pupilLoginDate = @loginDate
                  WHERE checkCode = @checkCode
                    AND pupilLoginDate IS NULL`
    const params = [
      { name: 'loginDate', value: loginDateTime, type: TYPES.DateTimeOffset },
      { name: 'checkCode', value: checkCode, type: TYPES.UniqueIdentifier }
    ]
    return this.sqlService.modify(sql, params)
  }
}
