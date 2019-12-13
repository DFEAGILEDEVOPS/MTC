import { SqlService, ITransactionRequest, ISqlParameter } from '../../sql/sql.service'
import * as mssql from 'mssql'

export interface ICheckNotifierDataService {
  updateCheckAsComplete (checkCode: string): Promise<void>
  markCheckAsProcessingFailed (checkCode: string): Promise<void>
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
    const checkRequest: ITransactionRequest = {
      sql: `UPDATE [mtc_admin].[check] c
      SET c.checkStatus_id=
      (SELECT cs.id FROM
        [mtc_admin].[checkStatus] cs
        WHERE cs.code='ERR')
      WHERE c.checkCode=@checkCode`,
      params: [
        checkCodeParam
      ]
    }
    const pupilRequest: ITransactionRequest = {
      sql: `UPDATE [mtc_admin].[pupil]
        SET checkComplete=1, ???failed
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

  updateCheckAsComplete (checkCode: string): Promise<void> {
    const checkCodeParam: ISqlParameter = {
      type: mssql.UniqueIdentifier,
      name: 'checkCode',
      value: checkCode
    }
    const checkRequest: ITransactionRequest = {
      sql: `UPDATE [mtc_admin].[check]
      SET checkStatus_id=(SELECT cs.id FROM
        [mtc_admin].[checkStatus] cs
        WHERE cs.code='CMP')
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
}
