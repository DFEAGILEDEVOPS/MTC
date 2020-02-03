import { SqlService, ITransactionRequest, ISqlParameter } from '../../sql/sql.service'
import * as mssql from 'mssql'

export interface ICheckNotifyDataService {
  createCheckCompleteRequest (checkCode: string): ITransactionRequest[]
  createProcessingFailedRequest (checkCode: string): ITransactionRequest
  createCheckReceivedRequest (checkCode: string): ITransactionRequest
  executeRequestsInTransaction (requests: ITransactionRequest[]): Promise<void>
}

export class CheckNotifyDataService implements ICheckNotifyDataService {

  private sqlService: SqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  createCheckCompleteRequest (checkCode: string): ITransactionRequest[] {
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
    return [checkRequest, pupilRequest]
  }

  createProcessingFailedRequest (checkCode: string): ITransactionRequest {
    return {
      sql: `UPDATE [mtc_admin].[check]
      SET checkStatus_id=
      (SELECT cs.id FROM
        [mtc_admin].[checkStatus] cs
        WHERE cs.code='ERR'),
        processingFailed=1
      WHERE checkCode=@checkCode`,
      params: [
        {
          type: mssql.UniqueIdentifier,
          name: 'checkCode',
          value: checkCode
        }
      ]
    }
  }
  createCheckReceivedRequest (checkCode: string): ITransactionRequest {
    return {
      params: [{
        type: mssql.UniqueIdentifier,
        name: 'checkCode',
        value: checkCode
      }],
      sql: `UPDATE [mtc_admin].[check]
      SET received = 1,
          receivedByServerAt = GETUTCDATE()
      WHERE checkCode = @checkCode
        AND received = 0
        AND receivedByServerAt IS NULL
      `
    }
  }
  executeRequestsInTransaction (requests: ITransactionRequest[]): Promise<void> {
    return this.sqlService.modifyWithTransactionParallel(requests)
  }
}
