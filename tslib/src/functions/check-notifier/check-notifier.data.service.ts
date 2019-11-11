import { SqlService } from '../../sql/sql.service'
import { CheckStatus } from './check-notifier.v1'
import * as mssql from 'mssql'

export interface ICheckNotifierDataService {
  updateCheckAsComplete (checkCode: string): Promise<void>
}

export class CheckNotifierDataService implements ICheckNotifierDataService {
  private sqlService: SqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  updateCheckAsComplete (checkCode: string): Promise<void> {
    const sql = `UPDATE [mtc_admin].[check]
                  SET checkStatus_id=@checkStatusId
                  WHERE checkCode=@checkCode`
    const params = [
      {
        type: mssql.Int,
        name: 'checkStatusId',
        value: CheckStatus.Complete
      },
      {
        type: mssql.UniqueIdentifier,
        name: 'checkCode',
        value: checkCode
      }
    ]
    return this.sqlService.modify(sql, params)
  }
}
