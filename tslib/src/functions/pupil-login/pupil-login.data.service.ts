import { Moment } from 'moment'
import { TYPES } from 'mssql'
import { SqlService } from '../../sql/sql.service'

export interface IPupilLoginDataService {
  updateCheckWithLoginTimestamp (checkCode: string, loginDateTime: Moment): Promise<void>
}

export class PupilLoginDataService implements IPupilLoginDataService {

  private sqlService: SqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  updateCheckWithLoginTimestamp (checkCode: string, loginDateTime: Moment): Promise<void> {
    const sql = `UPDATE [mtc_admin].[check]
               SET pupilLoginDate = @loginDate,
                   checkStatus_id = (SELECT TOP 1 id FROM [mtc_admin].[checkStatus]
                                    WHERE code = 'COL')
               WHERE checkCode = @checkCode`
    const params = [
      { name: 'loginDate', value: loginDateTime, type: TYPES.DateTimeOffset },
      { name: 'checkCode', value: checkCode, type: TYPES.UniqueIdentifier }
    ]
    return this.sqlService.modify(sql, params)
  }

}
