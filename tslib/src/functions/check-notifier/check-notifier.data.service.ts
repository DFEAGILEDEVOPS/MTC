import { SqlService, ITransactionRequest, ISqlParameter } from '../../sql/sql.service'
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
    const checkCodeParam: ISqlParameter = {
      type: mssql.UniqueIdentifier,
      name: 'checkCode',
      value: checkCode
    }
    const checkRequest: ITransactionRequest = {
      sql: `UPDATE [mtc_admin].[check]
      SET checkStatus_id=@checkStatusId
      WHERE checkCode=@checkCode`,
      params: [
        {
          type: mssql.Int,
          name: 'checkStatusId',
          value: CheckStatus.Complete
        },
        checkCodeParam
      ]
    }
    const pupilRequest: ITransactionRequest = {
      sql: `UPDATE [mtc_admin].[pupil]
        SET checkComplete=1
        FROM [mtc_admin].[pupil] p
        INNER JOIN [mtc_admin].[check] c
        ON p.id = c.pupil_id
        WHERE c.checkCode=@checkCode`,
      params: [
        checkCodeParam
      ]
    }
    return this.sqlService.modifyWithTransaction([checkRequest, pupilRequest])
  }
}
