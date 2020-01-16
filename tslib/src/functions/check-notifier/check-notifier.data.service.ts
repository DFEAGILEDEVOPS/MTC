import { SqlService, ITransactionRequest, ISqlParameter } from '../../sql/sql.service'
import * as mssql from 'mssql'

export interface ICheckNotifierDataService {
  updateCheckAsComplete (checkCode: string): Promise<void>
  markCheckAsProcessingFailed (checkCode: string): Promise<void>
  markCheckAsReceived (checkCode: string): Promise<void>
}

export class CheckNotifierDataService implements ICheckNotifierDataService {
  private sqlService: SqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  markCheckAsProcessingFailed (checkCode: string): Promise<void> {
    const checkCodeParam: ISqlParameter = {
      type: mssql.UniqueIdentifier,
      name: 'checkCode',
      value: checkCode
    }
    const sql = `UPDATE [mtc_admin].[check]
      SET checkStatus_id=
      (SELECT cs.id FROM
        [mtc_admin].[checkStatus] cs
        WHERE cs.code='ERR'),
        processingFailed=1
      WHERE checkCode=@checkCode`
    return this.sqlService.modify(sql, [checkCodeParam])
  }

  updateCheckAsComplete (checkCode: string): Promise<void> {
    const checkCodeParam: ISqlParameter = {
      type: mssql.UniqueIdentifier,
      name: 'checkCode',
      value: checkCode
    }
    const checkRequest: ITransactionRequest = {
      sql: `UPDATE [mtc_admin].[check]
      SET checkStatus_id=(SELECT cs.id
                          FROM
                          [mtc_admin].[checkStatus] cs
                          WHERE cs.code='CMP'),
        complete=1,
        completedAt=GETUTCDATE(),
        processingFailed=0
      WHERE checkCode=@checkCode`,
      params: [
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

  markCheckAsReceived (checkCode: string): Promise<void> {
    const checkCodeParam: ISqlParameter = {
      type: mssql.UniqueIdentifier,
      name: 'checkCode',
      value: checkCode
    }
    const sql = `
      UPDATE [mtc_admin].[check]
      SET received = 1,
          receivedByServerAt = GETUTCDATE()
      WHERE checkCode = @checkCode
        AND received = 0
        AND receivedByServerAt IS NULL
      `
    return this.sqlService.modify(sql, [checkCodeParam])
  }
}
